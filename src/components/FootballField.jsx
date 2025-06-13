import React, { useRef, useEffect, useState } from 'react';
import useDefensePositions from '../hooks/useDefensePositions';
import Konva from 'konva';
import {
  Stage,
  Layer,
  Path,
  Circle,
  Rect,
  Ellipse,
  Star,
  Line,
  Arrow,
  Text,
  Group,
  Label,
  Tag,
  RegularPolygon
} from 'react-konva';
import { line as d3Line, curveBasis, curveLinear } from 'd3-shape';

function pointsToXY(points) {
  const arr = [];
  for (let i = 0; i < points.length - 1; i += 2) {
    arr.push({ x: points[i], y: points[i + 1] });
  }
  return arr;
}

function getArrowHeadPoints(points, length = 10, width = 10) {
  const [x1, y1, x2, y2] = points.slice(-4);
  const angle = Math.atan2(y2 - y1, x2 - x1);

  const left = {
    x: x2 - length * Math.cos(angle) + width * Math.sin(angle),
    y: y2 - length * Math.sin(angle) - width * Math.cos(angle)
  };
  const right = {
    x: x2 - length * Math.cos(angle) - width * Math.sin(angle),
    y: y2 - length * Math.sin(angle) + width * Math.cos(angle)
  };
  return [x2, y2, left.x, left.y, right.x, right.y];

}

const FootballField = ({
  players,
  setPlayers,
  setSelectedPlayerIndex,
  routes,
  setRoutes,
  selectedPlayerIndex,
  setUndoStack,
  notes,
  setNotes,
  selectedRouteIndex,
  setSelectedRouteIndex,
  setSelectedNoteIndex,
  handlePointDrag,
  stageRef,
  defenseFormation
}) => {
  const width = 800;
  const height = 600;
  const lineOfScrimmageY = height - 250;
  const yardLineSpacing = 55;

  const defensePositions = useDefensePositions(defenseFormation);

  const localStageRef = useRef(null);
  const containerRef = useRef(null);
  const layerRef = useRef(null);
  const indicatorRef = useRef(null);
  const animRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [crosshair, setCrosshair] = useState(null);

  const showCrosshair = (x, y) => {
    setCrosshair({ x, y });
  };

  const hideCrosshair = () => {
    setCrosshair(null);
  };

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.offsetWidth;
      const newScale = Math.min(1, availableWidth / width);
      setScale(newScale);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    if (localStageRef.current && stageRef) {
      stageRef.current = localStageRef.current;
    }
  }, [stageRef]);

  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.batchDraw();
    }
  }, [players, routes, notes]);

  useEffect(() => {
    if (animRef.current) {
      animRef.current.stop();
      animRef.current = null;
    }
    if (selectedPlayerIndex !== null && indicatorRef.current && layerRef.current) {
      animRef.current = new Konva.Animation((frame) => {
        const rotateBy = (frame.timeDiff / 1000) * 180; // degrees per second
        indicatorRef.current.rotate(rotateBy);
      }, layerRef.current);
      animRef.current.start();
    }

    return () => {
      if (animRef.current) {
        animRef.current.stop();
        animRef.current = null;
      }
    };
  }, [selectedPlayerIndex]);

  const lines = [];
  lines.push({
    points: [0, lineOfScrimmageY, width, lineOfScrimmageY],
    stroke: 'black',
    strokeWidth: 3
  });

  for (let y = lineOfScrimmageY - yardLineSpacing * 2; y >= 0; y -= yardLineSpacing * 2) {
    lines.push({
      points: [0, y, width, y],
      stroke: '#ccc',
      strokeWidth: 1
    });
  }

  for (let y = lineOfScrimmageY + yardLineSpacing * 2; y <= height; y += yardLineSpacing * 2) {
    lines.push({
      points: [0, y, width, y],
      stroke: '#ccc',
      strokeWidth: 1
    });
  }

  const dragBoundFunc = (pos) => {
    const radius = 30;
    const newX = Math.max(radius, Math.min(width - radius, pos.x));
    const newY = Math.max(radius, Math.min(height - radius, pos.y));
    return { x: newX, y: newY };
  };


  const handleDragEnd = (e, index) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].x = e.target.x();
    updatedPlayers[index].y = e.target.y();
    setPlayers(updatedPlayers);
  };

  const handleClick = (index) => {
    setSelectedPlayerIndex(index);
    setSelectedRouteIndex(null);
    if (setSelectedNoteIndex) setSelectedNoteIndex(null);
  };

  const handleStageClick = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (setSelectedNoteIndex) setSelectedNoteIndex(null);
    if (clickedOnEmpty && selectedPlayerIndex !== null) {
      const stage = e.target.getStage();
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;

      const { x, y } = pointerPosition;
      const scaledX = x / scale;
      const scaledY = y / scale;
      const selectedPlayer = players[selectedPlayerIndex];
      const startX = selectedPlayer.x;
      const startY = selectedPlayer.y;

      setUndoStack((prev) => [
        ...prev,
        {
          players: JSON.parse(JSON.stringify(players)),
          routes: JSON.parse(JSON.stringify(routes)),
          notes: JSON.parse(JSON.stringify(notes)),
        },
      ]);

      let newRoutes = [...routes];

      let targetRoute = null;
      for (let i = newRoutes.length - 1; i >= 0; i--) {
        const route = newRoutes[i];
        if (route.playerId === selectedPlayer.id && !route.finished) {
          targetRoute = route;
          break;
        }
      }

      if (targetRoute) {
        targetRoute.points.push(scaledX, scaledY);
      } else {
        newRoutes.push({
          playerId: selectedPlayer.id,
          points: [startX, startY, scaledX, scaledY],
          color: selectedPlayer.fill,
          style: 'solid',
          smooth: false,
          endMarker: 'arrow',
          showLastSegment: true,
          finished: false,
          thickness: 7
        });
      }

      setRoutes(newRoutes);
    }
  };

  const handleRouteClick = (e, index) => {
    e.cancelBubble = true;
    setSelectedRouteIndex(index);
    setSelectedPlayerIndex(null);
  };

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto"
      style={{ touchAction: 'none' }}
    >
    <Stage
      ref={localStageRef}
      width={width}
      height={height}
      scaleX={scale}
      scaleY={scale}
      style={{ width: width * scale, height: height * scale }}
      className="bg-white border border-gray-300"
      onPointerDown={(e) => {
        handleStageClick(e);
      }}
      onTouchStart={(e) => {
        e.evt?.preventDefault();
        handleStageClick(e);
      }}
    >
      <Layer ref={layerRef}>
        {/* Field Lines */}
        {lines.map((line, index) => (
          <Path
            key={index}
            data={`M${line.points[0]},${line.points[1]} L${line.points[2]},${line.points[3]}`}
            stroke={line.stroke}
            strokeWidth={line.strokeWidth}
          />
        ))}

        {/* Routes */}
        {routes.map((route, index) => {
          const isSelected = selectedRouteIndex === index;
          const { points, color, style, endMarker, smooth, thickness } = route;

          let d3Path = '';
          if (points.length >= 4) {
            const pointsArray = pointsToXY([...points]);
            if (smooth) {
              const lastPoint = pointsArray[pointsArray.length - 1];
              // Duplicate the last point twice to help smooth the end segment
              pointsArray.push({ x: lastPoint.x, y: lastPoint.y });
              pointsArray.push({ x: lastPoint.x, y: lastPoint.y });
            }

            const lineGenerator = d3Line()
              .x((d) => d.x)
              .y((d) => d.y)
              .curve(smooth ? curveBasis : curveLinear);

            d3Path = lineGenerator(pointsArray);
          }

          return (
            <React.Fragment key={index}>
              {d3Path && (
                <Path
                  data={d3Path}
                  stroke={color}
                  strokeWidth={thickness || 7}
                  dash={style === 'dashed' ? [10, 10] : []}
                  hitStrokeWidth={20}
                  onClick={(e) => handleRouteClick(e, index)}
                />
              )}
              {endMarker === 'arrow' && points.length >= 4 && (
                smooth ? (
                  <Line
                    points={getArrowHeadPoints(points)}
                    closed
                    fill={color}
                    stroke={color}
                    strokeWidth={1}
                  />
                ) : (
                  <Arrow
                    points={points.slice(-4)}
                    stroke={color}
                    fill={color}
                    pointerLength={10}
                    pointerWidth={10}
                    strokeWidth={thickness || 7}
                  />
                )
              )}
              {isSelected &&
                points.map((_, i) => {
                  if (i % 2 !== 0) return null;
                  const x = points[i];
                  const y = points[i + 1];
                  return (
                    <Circle
                      key={`${index}-pt-${i}`}
                      x={x}
                      y={y}
                      radius={6}
                      fill="#FFD700"
                      stroke="#000"
                      strokeWidth={1}
                      draggable
                      onDragStart={(e) => showCrosshair(e.target.x(), e.target.y())}
                      onDragMove={(e) => {
                        showCrosshair(e.target.x(), e.target.y());
                        handlePointDrag(index, i / 2, e.target.x(), e.target.y());
                      }}
                      onDragEnd={() => hideCrosshair()}
                    />
                  );
                })}
            </React.Fragment>
          );
        })}

        {/* Notes */}
        {notes.map((note, index) => (
          <Label
            key={index}
            x={note.x}
            y={note.y}
            draggable
            onClick={(e) => {
              e.cancelBubble = true;
              if (setSelectedNoteIndex) setSelectedNoteIndex(index);
              if (setSelectedPlayerIndex) setSelectedPlayerIndex(null);
              if (setSelectedRouteIndex) setSelectedRouteIndex(null);
            }}
            onDragStart={(e) => showCrosshair(e.target.x(), e.target.y())}
            onDragMove={(e) => showCrosshair(e.target.x(), e.target.y())}
            onDragEnd={(e) => {
              hideCrosshair();
              const updatedNotes = [...notes];
              updatedNotes[index].x = e.target.x();
              updatedNotes[index].y = e.target.y();
              setNotes(updatedNotes);
            }}
          >
            <Tag
              fill={note.backgroundColor}
              stroke={note.border ? '#000' : undefined}
              strokeWidth={note.border ? 1 : 0}
              cornerRadius={4}
            />
            <Text
              text={note.text}
              fontSize={note.fontSize}
              fill={note.fontColor}
              fontStyle={note.bold ? 'bold' : 'normal'}
              padding={4}
            />
          </Label>
        ))}

        {/* Players */}
        {players.map((player, index) => (
          <Group
            key={index}
            x={player.x}
            y={player.y}
            draggable
            dragBoundFunc={dragBoundFunc}
            onDragStart={(e) => showCrosshair(e.target.x(), e.target.y())}
            onDragMove={(e) => showCrosshair(e.target.x(), e.target.y())}
            onDragEnd={(e) => {
              hideCrosshair();
              handleDragEnd(e, index);
            }}
            onClick={() => handleClick(index)}
          >
            {selectedPlayerIndex === index && (
              <Circle
                ref={indicatorRef}
                x={0}
                y={0}
                radius={40}
                stroke="#FFA500"
                strokeWidth={3}
                dash={[10, 5]}
                listening={false}
              />
            )}
            {player.shape === 'circle' && (
              <Circle
                x={0}
                y={0}
                radius={30}
                fill={player.fill}
                stroke={player.border ? '#000' : null}
                strokeWidth={player.border ? 2 : 0}
              />
            )}
            {player.shape === 'square' && (
              <Rect
                x={-30}
                y={-30}
                width={60}
                height={60}
                fill={player.fill}
                stroke={player.border ? '#000' : null}
                strokeWidth={player.border ? 2 : 0}
              />
            )}
            {player.shape === 'oval' && (
              <Ellipse
                x={0}
                y={0}
                radiusX={30}
                radiusY={20}
                fill={player.fill}
                stroke={player.border ? '#000' : null}
                strokeWidth={player.border ? 2 : 0}
              />
            )}
            {player.shape === 'star' && (
              <Star
                x={0}
                y={0}
                numPoints={5}
                innerRadius={15}
                outerRadius={30}
                fill={player.fill}
                stroke={player.border ? '#000' : null}
                strokeWidth={player.border ? 2 : 0}
              />
            )}
            <Text
              text={player.id}
              fontSize={24}
              fill={player.textColor}
              fontStyle="bold"
              align="center"
              offsetX={12}
              offsetY={12}
              x={3}
            y={4}
          />
        </Group>
        ))}

        {/* Defensive Players */}
        {defensePositions.map((pos, idx) => (
          <Group key={`def-${idx}`} x={pos.x} y={pos.y}>
            <RegularPolygon
              x={0}
              y={0}
              sides={3}
              radius={30}
              fill="#6B7280"
              rotation={180}
              cornerRadius={5}
            />
            <Text
              text="D"
              fontSize={24}
              fill="white"
              fontStyle="bold"
              align="center"
              offsetX={12}
              offsetY={12}
              x={3}
              y={4}
            />
          </Group>
        ))}

        {crosshair && (
          <>
            <Line
              points={[crosshair.x, 0, crosshair.x, height]}
              stroke="#d1d5db"
              strokeWidth={1}
              listening={false}
            />
            <Line
              points={[0, crosshair.y, width, crosshair.y]}
              stroke="#d1d5db"
              strokeWidth={1}
              listening={false}
            />
          </>
        )}
      </Layer>
    </Stage>
    </div>
  );
};

export default FootballField;
