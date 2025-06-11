import React, { useState, useEffect, useMemo } from 'react';

import { ChevronUp, ChevronDown, PlusCircle, Trash2 } from 'lucide-react';
import PrintOptionsModal from './PrintOptionsModal';
import { db, auth } from '../firebase';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { useTeamsContext } from '../context/TeamsContext.jsx';

const PlaybookLibrary = ({ user, openSignIn }) => {
  const [playbooks, setPlaybooks] = useState([]);
  const [collapsed, setCollapsed] = useState({});
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printBookId, setPrintBookId] = useState(null);
  const [playsMap, setPlaysMap] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const { selectedTeamId, teams } = useTeamsContext();


  useEffect(() => {
    const fetchBooks = async () => {
      if (!auth.currentUser) {
        openSignIn();
        const books = [];
        for (const key in localStorage) {
          if (key.startsWith('Playbook-')) {
            try {
              const book = JSON.parse(localStorage.getItem(key));
              books.push(book);
            } catch {
              // ignore malformed data
            }
          }
        }
        books.sort((a, b) => (a.order || 0) - (b.order || 0));
        setPlaybooks(books);
        return;
      }

      const snap = await getDocs(
        collection(db, 'users', auth.currentUser.uid, 'playbooks')
      );
      const arr = [];
      snap.forEach((d) => arr.push(d.data()));
      arr.sort((a, b) => (a.order || 0) - (b.order || 0));
      setPlaybooks(arr);
    };
    fetchBooks();
  }, [user]);

  const displayedPlaybooks = useMemo(() => {
    if (!selectedTeamId) return playbooks;
    const team = teams.find((t) => t.id === selectedTeamId);
    if (!team) return playbooks;
    if (!team.playbooks || team.playbooks.length === 0) return playbooks;
    return playbooks.filter((pb) => (team.playbooks || []).includes(pb.id));
  }, [playbooks, selectedTeamId, teams]);

  useEffect(() => {
    if (!auth.currentUser) {
      openSignIn();
      return;
    }
    const fetchPlays = async () => {
      const snap = await getDocs(
        collection(db, 'users', auth.currentUser.uid, 'plays')
      );
      const obj = {};
      snap.forEach((d) => {
        obj[d.id] = d.data();
      });
      setPlaysMap(obj);
    };
    fetchPlays();
  }, [user]);

  if (!auth.currentUser) {
    return <div className="p-4">Please sign in to view your playbooks.</div>;
  }

  const getPlay = (id) => playsMap[id] || null;

  const movePlay = async (bookId, index, direction) => {
    setPlaybooks((prev) =>
      prev.map((book) => {
        if (book.id !== bookId) return book;
        const ids = [...book.playIds];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= ids.length) return book;
        [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];
        const updatedBook = { ...book, playIds: ids };
        if (auth.currentUser) {
          setDoc(doc(db, 'users', auth.currentUser.uid, 'playbooks', bookId), updatedBook);
        } else {
          localStorage.setItem(bookId, JSON.stringify(updatedBook));
        }
        return updatedBook;
      })
    );
  };

  const addPlaybook = async () => {
    const name = prompt('Playbook name');
    if (!name) return;
    const order = playbooks.length ? Math.max(...playbooks.map(b => b.order || 0)) + 1 : 0;
    const id = `Playbook-${Date.now()}`;
    const book = { id, name, playIds: [], order };
    if (auth.currentUser) {
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'playbooks', id), book);
    } else {
      localStorage.setItem(id, JSON.stringify(book));
    }
    setPlaybooks(prev => [...prev, book]);
  };

  const deletePlaybook = async (id) => {
    if (auth.currentUser) {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'playbooks', id));
    } else {
      localStorage.removeItem(id);
    }
    setPlaybooks(prev => prev.filter(b => b.id !== id));
  };

  const movePlaybook = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= playbooks.length) return;
    const books = [...playbooks];
    [books[index], books[newIndex]] = [books[newIndex], books[index]];
    books.forEach((b, i) => {
      const updated = { ...b, order: i };
      if (auth.currentUser) {
        setDoc(doc(db, 'users', auth.currentUser.uid, 'playbooks', b.id), updated);
      } else {
        localStorage.setItem(b.id, JSON.stringify(updated));
      }
    });
    setPlaybooks(books);
  };

  const toggleCollapse = (id) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deletePlaybook(deleteId);
    setDeleteId(null);
  };

  const handlePrint = (bookId) => {
    setPrintBookId(bookId);
    setShowPrintModal(true);
  };

  const stripBranding = (dataUrl) => {
    return new Promise((resolve) => {
      if (!dataUrl) return resolve(null);
      const img = new Image();
      img.onload = () => {
        const titleH = 240;
        const brandingH = 168;
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height - titleH - brandingH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(
          img,
          0,
          titleH,
          img.width,
          canvas.height,
          0,
          0,
          canvas.width,
          canvas.height,
        );
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = dataUrl;
    });
  };

  const handlePrintConfirm = async (opts) => {
    const options = opts || {};

    const book = playbooks.find(b => b.id === printBookId);
    setShowPrintModal(false);

    if (!book) {
      setPrintBookId(null);
      return;
    }

    const plays = await Promise.all(
      book.playIds
        .map(pid => getPlay(pid))
        .filter(Boolean)
        .map(async (p) => ({
          ...p,
          displayImage: await stripBranding(p.printImage || p.image),
        }))
    );

    const w = window.open('', '_blank');
    if (!w) return;

    const includeTitle = options.includeTitle !== false;
    const includeNumber = options.includeNumber !== false;
    const perPage = options.playsPerPage || plays.length;
    const isWrist = options.type === 'wristband';
    const layout = options.layout || 4;


    // wristband layouts are always two rows. Map the number of plays
    // (4/6/8) to the correct column count (2/3/4).
    const columns = isWrist ? Math.ceil(layout / 2) : 4;

    // Treat width/height as the final wristband dimensions. Each cell is
    // sized by dividing the overall width/height by the layout.
    let scale = 1;
    let cellWidth = options.width / columns;
    let cellHeight = isWrist ? options.height / 2 : options.height;
    let gridWidth = options.width;
    let gridHeight = isWrist ? options.height : null;

    if (isWrist) {
      const maxPageWidth = 8; // leave room for printer margins
      if (options.width > maxPageWidth) {
        scale = maxPageWidth / options.width;
        gridWidth *= scale;
        gridHeight *= scale;
        cellWidth *= scale;
        cellHeight *= scale;
      }
    }



    const style = `
      <style>
        body{margin:0;padding:10px;font-family:sans-serif;}
        .page{page-break-after:always;margin-bottom:20px;}

                .grid{display:grid;${isWrist ? `grid-template-columns:repeat(${columns}, ${cellWidth}in);grid-template-rows:repeat(2, ${cellHeight}in);width:${gridWidth}in;height:${gridHeight}in;margin:auto;gap:0;` : 'grid-template-columns:repeat(4,1fr);gap:4px;'}}
        .play{position:relative;border:1px solid #000;${isWrist ? `width:${cellWidth}in;height:${cellHeight}in;` : 'aspect-ratio:4/3;padding:2px;'}text-align:center;}
        .label{position:absolute;top:0;left:0;display:flex;width:100%;z-index:1;}
                .num{background:#000;color:#fff;padding:2px 4px;font-size:10px;display:flex;justify-content:center;align-items:center;}
        .title{background:#eee;color:#000;padding:2px 4px;font-size:10px;flex:1;display:flex;align-items:center;}
        img{width:100%;height:100%;object-fit:contain;display:block;image-rendering:pixelated;}
      </style>
    `;

    w.document.write(`<!doctype html><html><head><title>${book.name}</title>${style}</head><body>`);

    if (isWrist) {
      for (let i = 0; i < plays.length; i += layout) {
        w.document.write('<div class="grid page">');
        const pagePlays = plays.slice(i, i + layout);
        pagePlays.forEach((play, idx) => {
          const num = i + idx + 1;
          w.document.write('<div class="play">');
          if (includeNumber || includeTitle) {
            w.document.write('<div class="label">');
            if (includeNumber) w.document.write(`<div class="num">${num}</div>`);
            if (includeTitle) w.document.write(`<div class="title">${play.name}</div>`);
            w.document.write('</div>');
          }
          if (play.displayImage) w.document.write(`<img src="${play.displayImage}" />`);
          w.document.write('</div>');
        });
        w.document.write('</div>');
      }
    } else {
      for (let i = 0; i < plays.length; i += perPage) {
        w.document.write('<div class="grid page">');
        const pagePlays = plays.slice(i, i + perPage);
        pagePlays.forEach((play, idx) => {
          const num = i + idx + 1;
          w.document.write('<div class="play">');
          if (includeNumber || includeTitle) {
            w.document.write('<div class="label">');
            if (includeNumber) w.document.write(`<div class="num">${num}</div>`);
            if (includeTitle) w.document.write(`<div class="title">${play.name}</div>`);
            w.document.write('</div>');
          }
          if (play.displayImage) w.document.write(`<img src="${play.displayImage}" />`);
          w.document.write('</div>');
        });
        w.document.write('</div>');
      }
    }

    w.addEventListener('load', () => {
      w.focus();
      w.print();
      w.close();
    });
    w.document.write('</body></html>');
    w.document.close();

    setPrintBookId(null);
  };


  return (
    <div className="p-4 max-w-7xl mx-auto">

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Playbooks</h1>
        <button
          onClick={addPlaybook}
          className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
        >
          <PlusCircle className="w-4 h-4 mr-1" /> Add
        </button>
      </div>
      {displayedPlaybooks.map((book) => {
        const bIndex = playbooks.findIndex((b) => b.id === book.id);
        return (

        <div key={book.id} className="mb-8 bg-gray-800 p-4 rounded">
          <div className="flex justify-between items-center mb-2">

            <div className="flex items-center gap-2">
              <button
                className="bg-gray-700 p-1 rounded"
                onClick={() => movePlaybook(bIndex, -1)}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                className="bg-gray-700 p-1 rounded"
                onClick={() => movePlaybook(bIndex, 1)}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <h2
                className="text-lg font-bold cursor-pointer"
                onClick={() => toggleCollapse(book.id)}
              >
                {book.name}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePrint(book.id)}
                className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-sm"
              >
                Print
              </button>
              <button
                onClick={() => setDeleteId(book.id)}
                className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!collapsed[book.id] && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {book.playIds.map((pid, idx) => {
                const play = getPlay(pid);
                if (!play) return null;
                return (
                  <div key={pid} className="bg-gray-700 p-2 rounded relative">
                    <div className="absolute top-1 right-1 flex flex-col gap-1">
                      <button
                        className="bg-gray-600 text-white rounded p-1"
                        onClick={() => movePlay(book.id, idx, -1)}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        className="bg-gray-600 text-white rounded p-1"
                        onClick={() => movePlay(book.id, idx, 1)}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    {play.displayImage || play.image ? (
                      <img
                        src={play.displayImage || play.image}
                        alt={play.name}
                        className="w-full h-40 object-contain rounded mb-2 bg-white"
                      />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center bg-gray-600 text-gray-400 rounded mb-2">
                        No Image
                      </div>
                    )}
                    <h3 className="text-sm font-bold">{play.name}</h3>
                  </div>
                );
                })}
              </div>
            )}
          </div>
        );
      })}
      {showPrintModal && (
        <PrintOptionsModal onClose={() => setShowPrintModal(false)} onPrint={handlePrintConfirm} />
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded p-4 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-2">Delete Playbook</h2>
            <p>Are you sure you want to delete this playbook?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeleteId(null)}
                className="px-3 py-1 rounded bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaybookLibrary;
