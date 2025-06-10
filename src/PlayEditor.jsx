import React, { useState, useEffect, useRef, useMemo } from "react";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import FootballField from "./components/FootballField";
import Toolbar from "./components/Toolbar";
import SaveAsModal from "./components/SaveAsModal";
import SaveModal from "./components/SaveModal";
import Toast from "./components/Toast";
import ModalPortal from "./components/ModalPortal";
import { User, ArrowRight, Trash2, StickyNote } from "lucide-react";
import huddlupLogo from "./assets/huddlup_logo_2.svg";
import { THICKNESS_MULTIPLIER } from "./components/PrintOptionsModal";

const width = 800;
const height = 600;
const centerX = width / 2;
const lineOfScrimmageY = height - 250;

const initialPlayersTemplate = [
  {
    id: "C",
    x: centerX,
    y: lineOfScrimmageY,
    shape: "square",
    fill: "#374151",
    textColor: "white",
    border: false,
  },
  {
    id: "Y",
    x: 100,
    y: lineOfScrimmageY,
    shape: "circle",
    fill: "#3B82F6",
    textColor: "white",
    border: false,
  },
  {
    id: "Z",
    x: centerX + 100,
    y: lineOfScrimmageY,
    shape: "circle",
    fill: "#10B981",
    textColor: "white",
    border: false,
  },
  {
    id: "X",
    x: width - 100,
    y: lineOfScrimmageY,
    shape: "circle",
    fill: "#F97316",
    textColor: "black",
    border: false,
  },
  {
    id: "Q",
    x: centerX,
    y: lineOfScrimmageY + 75,
    shape: "circle",
    fill: "#EF4444",
    textColor: "white",
    border: false,
  },
];

const colorOptions = [
  "#1E40AF",
  "#93C5FD",
  "#065F46",
  "#6EE7B7",
  "#C2410C",
  "#FDBA74",
  "#991B1B",
  "#FCA5A5",
  "#111827",
  "#9CA3AF",
];

const shapeOptions = ["circle", "square", "oval", "star"];
const endMarkerOptions = ["arrow", "dot", "T"];

const PlayEditor = ({ loadedPlay, openSignIn }) => {
  const [players, setPlayers] = useState(initialPlayersTemplate);
  const [routes, setRoutes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
  const [playName, setPlayName] = useState("");
  const [playTags, setPlayTags] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveAsName, setSaveAsName] = useState('');
  const [savedState, setSavedState] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [defenseFormation, setDefenseFormation] = useState('No');
  const stageRef = useRef(null);

  const currentState = useMemo(
    () => getCurrentState(),
    [players, routes, notes, playName, playTags],
  );

  const statesMatch = useMemo(
    () => savedState && JSON.stringify(currentState) === JSON.stringify(savedState),
    [currentState, savedState],
  );

  // Treat the initial state as saved so the indicator starts clean
  useEffect(() => {
    setSavedState(getCurrentState());
  }, []);

  useEffect(() => {
    setUndoStack([
      { players: [...initialPlayersTemplate], routes: [], notes: [] },
    ]);
  }, []);

  // New: Load the play if loadedPlay exists
  useEffect(() => {
    if (loadedPlay) {
      setPlayers(loadedPlay.players || initialPlayersTemplate);
      setRoutes(loadedPlay.routes || []);
      setNotes(loadedPlay.notes || []);
      setPlayName(loadedPlay.name || "");
      setPlayTags((loadedPlay.tags || []).join(", "));
      setSavedState({
        players: loadedPlay.players || [],
        routes: loadedPlay.routes || [],
        notes: loadedPlay.notes || [],
        name: loadedPlay.name || "",
        tags: loadedPlay.tags || [],
      });
    }
  }, [loadedPlay]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    if (saveError) {
      const timer = setTimeout(() => setSaveError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [saveError]);

  // Keep track of whether the current state matches the last saved snapshot
  useEffect(() => {
    if (!savedState) {
      setIsSaved(false);
      return;
    }
    setIsSaved(statesMatch);
    if (!statesMatch) {
      console.log('State mismatch', { current: currentState, savedState });
    }
  }, [statesMatch, savedState, currentState]);

  // Warn users before leaving the page if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSaved]);

  const handleNewPlay = () => {
    setUndoStack((prev) => [
      ...prev,
      { players: [...players], routes: [...routes], notes: [...notes] },
    ]);
    setPlayers(initialPlayersTemplate);
    setSelectedPlayerIndex(null);
    setRoutes([]);
    setNotes([]);
    setPlayName("");
    setPlayTags("");
    setSavedState(null);
  };

  function getCurrentState() {
    return {
      players: JSON.parse(JSON.stringify(players)),
      routes: JSON.parse(JSON.stringify(routes)),
      notes: JSON.parse(JSON.stringify(notes)),
      name: playName,
      tags: playTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ''),
    };
  }

  const handleSave = async () => {
    if (!playName.trim()) {
      alert("Please provide a name for your play.");
      return;
    }

    if (!auth.currentUser) {
      openSignIn();
      return;
    }

    try {
      const dataURL = await getExportDataUrl(4 / 3);
      const printURL = await getExportDataUrl(4 / 3, THICKNESS_MULTIPLIER);

      const playKey = `Play-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const playData = {
        id: playKey,
        players,
        routes,
        notes,
        name: playName,
        tags: playTags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ''),
        image: dataURL,
        printImage: printURL,
      };

      await setDoc(
        doc(db, 'users', auth.currentUser.uid, 'plays', playKey),
        playData,
      );

      const newState = getCurrentState();
      setSavedState(newState);
      setIsSaved(true); // Immediately reflect saved state in UI

      // Refresh state to ensure React re-renders and the saved label updates
      setPlayers([...players]);
      setRoutes([...routes]);
      setNotes([...notes]);

      setShowSaveModal(true);
      setShowToast(true);
    } catch (err) {
      console.error('Failed to save play', err);
      setSaveError('Failed to save play.');
    }
  };

  const handleSaveAs = () => {
    if (!auth.currentUser) {
      openSignIn();
      return;
    }

    setSaveAsName(playName);
    setShowSaveAsModal(true);
  };

  const handleSaveAsConfirm = async () => {
    const newName = saveAsName.trim() || playName;

    try {
      const dataURL = await getExportDataUrl(4 / 3);
      const printURL = await getExportDataUrl(4 / 3, THICKNESS_MULTIPLIER);
      const playKey = `Play-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const playData = {
        id: playKey,
        players,
        routes,
        notes,
        name: newName,
        tags: playTags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ''),
        image: dataURL,
        printImage: printURL,
      };

      await setDoc(
        doc(db, 'users', auth.currentUser.uid, 'plays', playKey),
        playData,
      );
      setPlayName(newName);
      // Ensure the "Save As" modal closes before showing confirmation
      setShowSaveAsModal(false);

      const newState = {
        players: JSON.parse(JSON.stringify(players)),
        routes: JSON.parse(JSON.stringify(routes)),
        notes: JSON.parse(JSON.stringify(notes)),
        name: newName,
        tags: playTags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ''),
      };
      setSavedState(newState);
      setIsSaved(true); // Immediately reflect saved state in UI
      // Refresh state to ensure UI updates correctly
      setPlayers([...players]);
      setRoutes([...routes]);
      setNotes([...notes]);

      setShowSaveModal(true);
      setShowToast(true);
    } catch (err) {
      console.error('Failed to save play', err);
      setSaveError('Failed to save play.');
    }

  };

  const handleUndo = () => {
    if (undoStack.length > 1) {
      setUndoStack((prevStack) => {
        const newStack = [...prevStack];
        newStack.pop();
        const prevState = newStack[newStack.length - 1];
        setPlayers(prevState.players);
        setRoutes(prevState.routes);
        setNotes(prevState.notes);
        setSelectedPlayerIndex(null);
        setSelectedRouteIndex(null);
        setSelectedNoteIndex(null);
        return newStack;
      });
    }
  };

  const handleDeleteRoute = () => {
    if (selectedRouteIndex !== null) {
      setUndoStack((prev) => [
        ...prev,
        { players: [...players], routes: [...routes], notes: [...notes] },
      ]);
      const updatedRoutes = [...routes];
      updatedRoutes.splice(selectedRouteIndex, 1);
      setRoutes(updatedRoutes);
      setSelectedRouteIndex(null);
    }
  };

  const handleAddNote = () => {
    const newNote = {
      x: 100,
      y: 100,
      text: "New Note",
      fontSize: 16,
      fontColor: "#000000",
      bold: false,
      backgroundColor: "#FFFFFF",
      border: false,
    };
    setUndoStack((prev) => [
      ...prev,
      { players: [...players], routes: [...routes], notes: [...notes] },
    ]);
    setNotes([...notes, newNote]);
  };

  const handleLabelChange = (value) => {
    const updatedPlayers = [...players];
    updatedPlayers[selectedPlayerIndex].id = value;
    setPlayers(updatedPlayers);
  };

  const handleColorChange = (color) => {
    const updatedPlayers = [...players];
    updatedPlayers[selectedPlayerIndex].fill = color;
    setPlayers(updatedPlayers);
  };

  const handleShapeChange = (shape) => {
    const updatedPlayers = [...players];
    updatedPlayers[selectedPlayerIndex].shape = shape;
    setPlayers(updatedPlayers);
  };

  const handleBorderToggle = () => {
    const updatedPlayers = [...players];
    updatedPlayers[selectedPlayerIndex].border =
      !updatedPlayers[selectedPlayerIndex].border;
    setPlayers(updatedPlayers);
  };

  const updateRouteProperty = (property, value) => {
    if (selectedRouteIndex !== null) {
      const updatedRoutes = [...routes];
      updatedRoutes[selectedRouteIndex][property] = value;
      setRoutes(updatedRoutes);
    }
  };

  const updateNoteProperty = (property, value) => {
    if (selectedNoteIndex !== null) {
      const updatedNotes = [...notes];
      updatedNotes[selectedNoteIndex][property] = value;
      setNotes(updatedNotes);
    }
  };

  const handlePointDrag = (routeIdx, pointIdx, x, y) => {
    setRoutes((prevRoutes) => {
      const newRoutes = [...prevRoutes];
      const route = { ...newRoutes[routeIdx] };
      const points = [...route.points];
      points[pointIdx * 2] = x;
      points[pointIdx * 2 + 1] = y;
      route.points = points;
      newRoutes[routeIdx] = route;
      return newRoutes;
    });
  };

  const getExportDataUrl = async (ratio, thicknessMultiplier = 1) => {
    return new Promise((resolve) => {
      if (!stageRef.current) {
        resolve(null);
        return;
      }

      const originals = routes.map((r) => r.thickness || 7);

      if (thicknessMultiplier !== 1) {
        routes.forEach((route, idx) => {
          route.thickness = originals[idx] * thicknessMultiplier;
        });
        stageRef.current.draw();
      }

      const capture = () => {
        const dataURL = stageRef.current.toDataURL({
          pixelRatio: 4,
          mimeType: "image/png",
          backgroundColor: "white",
        });

        if (thicknessMultiplier !== 1) {
          routes.forEach((route, idx) => {
            route.thickness = originals[idx];
          });
          stageRef.current.draw();
        }

        const img = new Image();
        img.src = dataURL;
        img.onload = () => {
          const stageW = img.width;
          const stageH = img.height;
          const stageRatio = stageW / stageH;
          let cropW = stageW;
          let cropH = stageH;
          let cropX = 0;
          let cropY = 0;

          if (stageRatio > ratio) {
            cropH = stageH;
            cropW = stageH * ratio;
            cropX = (stageW - cropW) / 2;
          } else if (stageRatio < ratio) {
            cropW = stageW;
            cropH = stageW / ratio;
            cropY = (stageH - cropH) / 2;
          }

          const backfieldCut = 40;
          if (cropY + cropH > stageH - backfieldCut) {
            cropH = stageH - backfieldCut - cropY;
          }

          const logoImg = new Image();
          logoImg.src = huddlupLogo;
          logoImg.onload = () => {
            const titleH = 240;
            const brandingH = 168; // reduced by ~30% for smaller bottom label
            const canvas = document.createElement("canvas");
            canvas.width = cropW;
            canvas.height = cropH + titleH + brandingH;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Top area for play title
            ctx.fillStyle = "#d1d5db";
            ctx.fillRect(0, 0, cropW, titleH);

            // Field image
            ctx.drawImage(
              img,
              cropX,
              cropY,
              cropW,
              cropH,
              0,
              titleH,
              cropW,
              cropH,
            );

            // Bottom branding background
            ctx.fillStyle = "#d1d5db";
            ctx.fillRect(0, titleH + cropH, cropW, brandingH);

            // Play title
            ctx.fillStyle = "#000";
            ctx.font = "bold 192px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(playName || "Unnamed Play", cropW / 2, titleH / 2);

            // "made with" text and logo
            ctx.font = "134px sans-serif"; // scaled with reduced branding area
            ctx.fillStyle = "#9CA3AF";
            ctx.textAlign = "left";
            const madeWith = "made with";
            const mwWidth = ctx.measureText(madeWith).width;
            const logoHeight = 134; // match the reduced font size
            const logoWidth = (logoImg.width * logoHeight) / logoImg.height;
            const spacing = 20;
            const rightMargin = 40;
            const startX = cropW - mwWidth - logoWidth - spacing - rightMargin;
            ctx.fillText(madeWith, startX, titleH + cropH + brandingH / 2);
            ctx.drawImage(
              logoImg,
              startX + mwWidth + spacing,
              titleH + cropH + brandingH / 2 - logoHeight / 2,
              logoWidth,
              logoHeight,
            );

            resolve(canvas.toDataURL("image/png"));
          };
        };
      };

      if (thicknessMultiplier !== 1) {
        requestAnimationFrame(capture);
      } else {
        capture();
      }
    });
  };

  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleExport = async (ratio) => {
    const url = await getExportDataUrl(ratio);
    if (!url) return;

    if (isIos) {
      // iOS Safari doesn't reliably support the download attribute
      window.open(url, "_blank");
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = `${playName || "play"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (ratio) => {
    const url = await getExportDataUrl(ratio);

    if (!url) return;
    if (navigator.share && navigator.canShare && !isIos) {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], `${playName || "play"}.png`, {
        type: "image/png",
      });
      try {
        await navigator.share({ files: [file], title: playName || "Play" });
        return;
      } catch (e) {
        console.error(e);
      }
    }

    if (navigator.share && isIos) {
      try {
        await navigator.share({ url, title: playName || "Play" });
        return;
      } catch (e) {
        console.error(e);
      }
    }

    if (isIos) {
      window.open(url, "_blank");
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = `${playName || "play"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPlaySaved = () => isSaved;

  return (
    <div className="flex flex-col bg-gray-900 text-white min-h-screen">
      <div className="w-full text-center mt-2">
        <h2 className="text-xl font-bold">{playName || "Unnamed Play"}</h2>
        <p
          className={`text-sm ${isPlaySaved() ? "text-green-400" : "text-yellow-400"}`}
        >
          {isPlaySaved() ? "All changes saved" : "Unsaved changes"}
        </p>
      </div>

      <main className="flex flex-col lg:flex-row items-start mt-4 px-4 w-full max-w-7xl mx-auto gap-4">
        <div className="flex flex-col gap-4 w-full lg:w-60 order-2 lg:order-none">
          {/* Player Editor */}
          <aside className="bg-gray-800 p-4 rounded">
            <h2 className="text-lg font-bold flex items-center mb-2">
              <User className="w-4 h-4 mr-1" /> Player Editor
            </h2>
            {selectedPlayerIndex !== null ? (
              <>
                <label className="block mb-1">Label</label>
                <input
                  type="text"
                  value={players[selectedPlayerIndex].id}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  className="w-full p-1 rounded text-white bg-gray-700"
                />
                <label className="block mt-2 mb-1">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-full border border-white"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
                <label className="block mt-2 mb-1">Shape</label>
                <select
                  value={players[selectedPlayerIndex].shape}
                  onChange={(e) => handleShapeChange(e.target.value)}
                  className="w-full p-1 rounded text-white bg-gray-700"
                >
                  {shapeOptions.map((shape) => (
                    <option key={shape} value={shape}>
                      {shape.charAt(0).toUpperCase() + shape.slice(1)}
                    </option>
                  ))}
                </select>
                <label className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={players[selectedPlayerIndex].border}
                    onChange={handleBorderToggle}
                    className="form-checkbox h-4 w-4"
                  />
                  <span>Border</span>
                </label>
              </>
            ) : (
              <p className="text-sm">Select a player to edit.</p>
            )}
          </aside>
        </div>

        <div className="overflow-x-auto order-1 lg:order-none flex-1">
          <FootballField
            players={players}
            setPlayers={setPlayers}
            setSelectedPlayerIndex={setSelectedPlayerIndex}
          routes={routes}
          setRoutes={setRoutes}
          selectedPlayerIndex={selectedPlayerIndex}
          setUndoStack={setUndoStack}
          notes={notes}
          setNotes={setNotes}
          selectedRouteIndex={selectedRouteIndex}
          setSelectedRouteIndex={setSelectedRouteIndex}
          selectedNoteIndex={selectedNoteIndex}
          setSelectedNoteIndex={setSelectedNoteIndex}
          handlePointDrag={handlePointDrag}
          stageRef={stageRef}
          defenseFormation={defenseFormation}
        />
        </div>

        <div className="flex flex-col gap-4 w-full lg:w-60 order-3 lg:order-none">
          {/* Route Editor */}
          <aside className="bg-gray-800 p-4 rounded">
            <h2 className="text-lg font-bold flex items-center mb-2">
              <ArrowRight className="w-4 h-4 mr-1" /> Route Editor
            </h2>
            {selectedRouteIndex !== null ? (
              <>
                <button
                  className="flex items-center bg-red-600 hover:bg-red-500 px-2 py-1 rounded mb-2"
                  onClick={handleDeleteRoute}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete Route
                </button>

                <label className="block mt-2 mb-1">Line Style</label>
                <select
                  value={routes[selectedRouteIndex].style}
                  onChange={(e) => updateRouteProperty("style", e.target.value)}
                  className="w-full p-1 rounded text-white bg-gray-700"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                </select>

                <label className="block mt-2 mb-1">Line Thickness</label>
                <select
                  value={routes[selectedRouteIndex].thickness || 7}
                  onChange={(e) =>
                    updateRouteProperty(
                      "thickness",
                      parseInt(e.target.value, 10),
                    )
                  }
                  className="w-full p-1 rounded text-white bg-gray-700"
                >
                  <option value={5}>Thin</option>
                  <option value={7}>Default</option>
                  <option value={9}>Thick</option>
                </select>

                <label className="block mt-2 mb-1">End Marker</label>
                <select
                  value={routes[selectedRouteIndex].endMarker}
                  onChange={(e) =>
                    updateRouteProperty("endMarker", e.target.value)
                  }
                  className="w-full p-1 rounded text-white bg-gray-700"
                >
                  {endMarkerOptions.map((marker) => (
                    <option key={marker} value={marker}>
                      {marker.charAt(0).toUpperCase() + marker.slice(1)}
                    </option>
                  ))}
                </select>

                <label className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={routes[selectedRouteIndex].smooth}
                    onChange={() =>
                      updateRouteProperty(
                        "smooth",
                        !routes[selectedRouteIndex].smooth,
                      )
                    }
                    className="form-checkbox h-4 w-4"
                  />
                  <span>Smooth</span>
                </label>
              </>
            ) : (
              <p className="text-sm">Select a route to edit.</p>
            )}
          </aside>

          {/* Note Editor */}
          <aside className="bg-gray-800 p-4 rounded">
            <h2 className="text-lg font-bold flex items-center mb-2">
              <StickyNote className="w-4 h-4 mr-1" /> Note Editor
            </h2>
            {selectedNoteIndex !== null ? (
              <>
                <label className="block mb-1">Text</label>
                <input
                  type="text"
                  value={notes[selectedNoteIndex].text}
                  onChange={(e) => updateNoteProperty("text", e.target.value)}
                  className="w-full p-1 rounded text-white bg-gray-700"
                />
                <label className="block mt-2 mb-1">Font Color</label>
                <select
                  value={notes[selectedNoteIndex].fontColor}
                  onChange={(e) =>
                    updateNoteProperty("fontColor", e.target.value)
                  }
                  className="w-full p-1 rounded text-white bg-gray-700"
                >
                  <option value="#000000">Black</option>
                  <option value="#FFFFFF">White</option>
                </select>
                <label className="block mt-2 mb-1">Font Size</label>
                <select
                  value={notes[selectedNoteIndex].fontSize}
                  onChange={(e) =>
                    updateNoteProperty("fontSize", parseInt(e.target.value))
                  }
                  className="w-full p-1 rounded text-white bg-gray-700"
                >
                  <option value={12}>Small</option>
                  <option value={16}>Medium</option>
                  <option value={20}>Large</option>
                </select>
                <label className="block mt-2 mb-1">Background Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-full border border-white"
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        updateNoteProperty("backgroundColor", color)
                      }
                    />
                  ))}
                </div>
                <label className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={notes[selectedNoteIndex].bold}
                    onChange={() =>
                      updateNoteProperty("bold", !notes[selectedNoteIndex].bold)
                    }
                    className="form-checkbox h-4 w-4"
                  />
                  <span>Bold Text</span>
                </label>
                <label className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={notes[selectedNoteIndex].border}
                    onChange={() =>
                      updateNoteProperty(
                        "border",
                        !notes[selectedNoteIndex].border,
                      )
                    }
                    className="form-checkbox h-4 w-4"
                  />
                  <span>Border</span>
                </label>
              </>
            ) : (
              <p className="text-sm">Select a note to edit.</p>
            )}
          <button
            className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded mt-2"
            onClick={handleAddNote}
          >
            Add Note
          </button>
        </aside>

        {/* Defense Options */}
        <aside className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-bold mb-2">Defense Formation</h2>
          <select
            value={defenseFormation}
            onChange={(e) => setDefenseFormation(e.target.value)}
            className="w-full p-1 rounded text-white bg-gray-700"
          >
            <option value="No">No</option>
            <option value="1-3-1">1-3-1</option>
            <option value="3-2">3-2</option>
            <option value="4-1">4-1</option>
            <option value="2-3">2-3</option>
          </select>
        </aside>


        </div>
      </main>

      <div className="w-full bg-gray-800 mt-4">
        <div className="max-w-7xl mx-auto p-4 flex justify-center">
          <Toolbar
            onNewPlay={handleNewPlay}
            onUndo={handleUndo}
            onExport={handleExport}
            onShare={handleShare}
            onSave={handleSave}
            onSaveAs={handleSaveAs}
            playName={playName}
            onPlayNameChange={setPlayName}
            playTags={playTags}
            onPlayTagsChange={setPlayTags}
          />
        </div>
      </div>

      {showSaveAsModal && (
        <SaveAsModal
          value={saveAsName}
          onChange={setSaveAsName}
          onCancel={() => setShowSaveAsModal(false)}
          onSave={handleSaveAsConfirm}
        />
      )}

      {showSaveModal && (
        <ModalPortal>
          <SaveModal onClose={() => setShowSaveModal(false)} />
        </ModalPortal>
      )}

      {saveError && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-md">
          {saveError}
        </div>
      )}

      {showToast && (
        <ModalPortal>
          <Toast message="Play saved to library!" />
        </ModalPortal>
      )}
    </div>
  );
};

export default PlayEditor;
