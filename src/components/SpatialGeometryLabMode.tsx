import React, { useRef, useState, useEffect, useCallback } from 'react';
import { LanguageOption } from '../types/curriculum';
import { FormulaDisplay } from './FormulaDisplay';
import { Rotate3d, Compass, ZoomIn, ZoomOut, RefreshCw, Eye } from 'lucide-react';
import { soundFeedback } from '../utils/feedbackSounds';

interface SpatialGeometryLabModeProps {
  lang: LanguageOption;
  dualLang: boolean;
  onLabChallengeCompleted?: (xp: number, score: number) => void;
}

type SpatialScenario = 'sphere_plane' | 'cross_product' | 'point_projections';

export const SpatialGeometryLabMode: React.FC<SpatialGeometryLabModeProps> = ({
  lang,
  dualLang,
  onLabChallengeCompleted
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scenario, setScenario] = useState<SpatialScenario>('sphere_plane');
  const [completed3DMissions, setCompleted3DMissions] = useState<Record<SpatialScenario, boolean>>({
    sphere_plane: false,
    cross_product: false,
    point_projections: false
  });
  const [missionFeedback, setMissionFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // 3D Camera Angles & Zoom
  const [angleX, setAngleX] = useState<number>(25); // Pitch (degrees)
  const [angleY, setAngleY] = useState<number>(45); // Yaw (degrees)
  const [zoom, setZoom] = useState<number>(1.0);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Scenario 1: Sphere & Plane Parameters
  const [sphereRadius, setSphereRadius] = useState<number>(60);
  const [planeDistance, setPlaneDistance] = useState<number>(45); // d(Omega, P)

  // Scenario 2: Cross Product Angle
  const [vectorAngle, setVectorAngle] = useState<number>(60);

  // Scenario 3: Point Coordinates (x, y, z)
  const [pointCoords, setPointCoords] = useState<{ x: number; y: number; z: number }>({
    x: 50,
    y: 60,
    z: 40
  });

  // 3D Point Projection to 2D Screen
  const project3D = useCallback(
    (x: number, y: number, z: number, originX: number, originY: number): { x: number; y: number; depth: number } => {
      const radX = (angleX * Math.PI) / 180;
      const radY = (angleY * Math.PI) / 180;

      // Rotate around Y axis
      const x1 = x * Math.cos(radY) + z * Math.sin(radY);
      const y1 = y;
      const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

      // Rotate around X axis
      const x2 = x1;
      const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
      const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

      // Scale with zoom
      const screenX = originX + x2 * zoom;
      const screenY = originY - y2 * zoom; // Y is inverted in canvas

      return { x: screenX, y: screenY, depth: z2 };
    },
    [angleX, angleY, zoom]
  );

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const originX = canvas.width / 2;
    const originY = canvas.height / 2 + 10;

    // Draw 3D Axes (O, x, y, z)
    const axisLen = 140;
    const o = project3D(0, 0, 0, originX, originY);
    const axX = project3D(axisLen, 0, 0, originX, originY);
    const axY = project3D(0, axisLen, 0, originX, originY);
    const axZ = project3D(0, 0, axisLen, originX, originY);

    // Negative dashed axes
    const naxX = project3D(-axisLen * 0.7, 0, 0, originX, originY);
    const naxY = project3D(0, -axisLen * 0.7, 0, originX, originY);
    const naxZ = project3D(0, 0, -axisLen * 0.7, originX, originY);

    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    [naxX, naxY, naxZ].forEach(p => {
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.restore();

    // Positive Axes
    const drawAxisLine = (p: { x: number; y: number }, color: string, label: string) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(label, p.x + 6, p.y + 4);
    };

    drawAxisLine(axX, '#f43f5e', 'X (i⃗)');
    drawAxisLine(axY, '#10b981', 'Y (j⃗)');
    drawAxisLine(axZ, '#38bdf8', 'Z (k⃗)');

    // Render Scenarios
    if (scenario === 'sphere_plane') {
      const R = sphereRadius;
      const d = planeDistance;

      // Draw Wireframe Sphere at Origin
      ctx.save();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 1.5;

      // Latitudinal circles
      for (let lat = -60; lat <= 60; lat += 30) {
        const radLat = (lat * Math.PI) / 180;
        const rSub = R * Math.cos(radLat);
        const ySub = R * Math.sin(radLat);

        ctx.beginPath();
        for (let lon = 0; lon <= 360; lon += 15) {
          const radLon = (lon * Math.PI) / 180;
          const px = rSub * Math.cos(radLon);
          const pz = rSub * Math.sin(radLon);
          const pt = project3D(px, ySub, pz, originX, originY);
          if (lon === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      // Longitudinal circles
      for (let lon = 0; lon < 180; lon += 45) {
        const radLon = (lon * Math.PI) / 180;
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 15) {
          const radLat = (lat * Math.PI) / 180;
          const px = R * Math.cos(radLat) * Math.cos(radLon);
          const pz = R * Math.cos(radLat) * Math.sin(radLon);
          const py = R * Math.sin(radLat);
          const pt = project3D(px, py, pz, originX, originY);
          if (lat === -90) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      // Sphere Center Omega
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(o.x, o.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('Ω', o.x - 14, o.y - 6);

      // Draw Cutting Plane (horizontal plane at height d)
      const pSize = 110;
      const p1 = project3D(-pSize, d, -pSize, originX, originY);
      const p2 = project3D(pSize, d, -pSize, originX, originY);
      const p3 = project3D(pSize, d, pSize, originX, originY);
      const p4 = project3D(-pSize, d, pSize, originX, originY);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Intersection circle if d < R
      if (d < R) {
        const rCircle = Math.sqrt(R * R - d * d);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let ang = 0; ang <= 360; ang += 10) {
          const rad = (ang * Math.PI) / 180;
          const cx = rCircle * Math.cos(rad);
          const cz = rCircle * Math.sin(rad);
          const cpt = project3D(cx, d, cz, originX, originY);
          if (ang === 0) ctx.moveTo(cpt.x, cpt.y);
          else ctx.lineTo(cpt.x, cpt.y);
        }
        ctx.stroke();
      }

      // Distance line from Omega to H
      const hPt = project3D(0, d, 0, originX, originY);
      ctx.strokeStyle = '#fbbf24';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(hPt.x, hPt.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(hPt.x, hPt.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('H', hPt.x + 8, hPt.y + 4);
      ctx.restore();
    } else if (scenario === 'cross_product') {
      const uLen = 80;
      const vLen = 75;
      const rad = (vectorAngle * Math.PI) / 180;

      // Vector u along X axis
      const uPt = project3D(uLen, 0, 0, originX, originY);
      // Vector v in X-Z plane with angle
      const vPt = project3D(vLen * Math.cos(rad), 0, vLen * Math.sin(rad), originX, originY);

      // Cross product w = u ^ v along Y axis
      const wLen = 90;
      const wPt = project3D(0, wLen, 0, originX, originY);

      // Parallelogram completion
      const uvSum = project3D(
        uLen + vLen * Math.cos(rad),
        0,
        vLen * Math.sin(rad),
        originX,
        originY
      );

      ctx.save();
      // Shaded area of parallelogram
      ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(uPt.x, uPt.y);
      ctx.lineTo(uvSum.x, uvSum.y);
      ctx.lineTo(vPt.x, vPt.y);
      ctx.closePath();
      ctx.fill();

      // Vector u
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(uPt.x, uPt.y);
      ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('u⃗', uPt.x + 8, uPt.y);

      // Vector v
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(vPt.x, vPt.y);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('v⃗', vPt.x + 8, vPt.y);

      // Normal Cross Product vector w = u ^ v
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(wPt.x, wPt.y);
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.fillText('n⃗ = u⃗ ∧ v⃗ (متجه عمودي)', wPt.x + 8, wPt.y - 4);

      // Right angle indicator at origin
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      const sqU = project3D(14, 0, 0, originX, originY);
      const sqW = project3D(0, 14, 0, originX, originY);
      const sqUW = project3D(14, 14, 0, originX, originY);
      ctx.beginPath();
      ctx.moveTo(sqU.x, sqU.y);
      ctx.lineTo(sqUW.x, sqUW.y);
      ctx.lineTo(sqW.x, sqW.y);
      ctx.stroke();
      ctx.restore();
    } else if (scenario === 'point_projections') {
      const { x, y, z } = pointCoords;
      const mPt = project3D(x, y, z, originX, originY);
      const mX = project3D(x, 0, 0, originX, originY);
      const mY = project3D(0, y, 0, originX, originY);
      const mZ = project3D(0, 0, z, originX, originY);

      // Projections on planes
      const mXY = project3D(x, y, 0, originX, originY);
      const mXZ = project3D(x, 0, z, originX, originY);
      const mYZ = project3D(0, y, z, originX, originY);

      ctx.save();
      // Box lines
      ctx.strokeStyle = '#64748b';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;

      // Base rectangle in X-Z
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(mX.x, mX.y);
      ctx.lineTo(mXZ.x, mXZ.y);
      ctx.lineTo(mZ.x, mZ.y);
      ctx.closePath();
      ctx.stroke();

      // Upright lines to M
      ctx.beginPath();
      ctx.moveTo(mXZ.x, mXZ.y);
      ctx.lineTo(mPt.x, mPt.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(mPt.x, mPt.y);
      ctx.lineTo(mXY.x, mXY.y);
      ctx.lineTo(mY.x, mY.y);
      ctx.lineTo(mYZ.x, mYZ.y);
      ctx.lineTo(mPt.x, mPt.y);
      ctx.stroke();

      ctx.setLineDash([]);

      // Point M
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(mPt.x, mPt.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`M(${Math.round(x)}, ${Math.round(y)}, ${Math.round(z)})`, mPt.x + 8, mPt.y - 6);
      ctx.restore();
    }
  }, [project3D, scenario, sphereRadius, planeDistance, vectorAngle, pointCoords]);

  // Handle Resize and Drag Rotation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = Math.max(380, parent.clientHeight || 420);
      drawScene();
    }
  }, [drawScene]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setAngleY(prev => (prev + dx * 0.7) % 360);
    setAngleX(prev => Math.max(-85, Math.min(85, prev - dy * 0.7)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const resetCamera = () => {
    setAngleX(25);
    setAngleY(45);
    setZoom(1.0);
  };

  // Condition evaluation for Scenario 1
  const dVal = planeDistance;
  const rVal = sphereRadius;
  const intersectionState =
    dVal > rVal
      ? { text: lang === 'ar' ? 'المستوى يقطع الفلكة خارجياً: (P) ∩ (S) = ∅' : 'Le plan est extérieur à la sphère : (P) ∩ (S) = ∅', color: 'text-rose-400' }
      : dVal === rVal
      ? { text: lang === 'ar' ? 'المستوى مماس للفلكة في النقطة H' : 'Le plan est tangent à la sphère en H', color: 'text-amber-400' }
      : {
          text: lang === 'ar'
            ? `التقاطع دائرة مركزها H وشعاعها r = √(R² - d²) = ${Math.round(Math.sqrt(rVal * rVal - dVal * dVal))} وحدة`
            : `Intersection = Cercle C(H, r = √(R² - d²)) = ${Math.round(Math.sqrt(rVal * rVal - dVal * dVal))} u`,
          color: 'text-emerald-400'
        };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-600 text-white flex items-center gap-1.5 shadow-md">
              <Rotate3d className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'مختبر الهندسة الفضائية 3D' : 'Laboratoire de Géométrie Spatiale 3D'}</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-950 text-cyan-300 border border-slate-800">
              {lang === 'ar' ? 'مقرر 2BAC و 1BAC' : 'Programme 1BAC & 2BAC'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1">
            {lang === 'ar'
              ? 'المحاكاة ثلاثية الأبعاد التفاعلية للفلكة والمستويات والمتجهات'
              : 'Visualisation 3D Interactive : Sphère, Plan & Produit Vectoriel'}
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {lang === 'ar'
              ? 'حرك الفأرة أو اسحب بإصبعك لتدوير الفضاء 360 درجة، مع ربط مباشر بين التمثيل الهندسي والصيغ التحليلية المقررة في الامتحانات الإشهادية.'
              : 'Glissez pour pivoter la scène à 360°, zoomez et observez les propriétés analytiques de l\'espace.'}
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 border border-slate-800 p-1.5 rounded-xl">
          <button
            type="button"
            onClick={() => setScenario('sphere_plane')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              scenario === 'sphere_plane' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? '1. الفلكة والمستوى' : '1. Sphère & Plan'}
          </button>
          <button
            type="button"
            onClick={() => setScenario('cross_product')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              scenario === 'cross_product' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? '2. الجداء المتجهي' : '2. Produit Vectoriel'}
          </button>
          <button
            type="button"
            onClick={() => setScenario('point_projections')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              scenario === 'point_projections' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? '3. إحداثيات نقطة M(x,y,z)' : '3. Coordonnées M(x,y,z)'}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas & Analytical Controls Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 3D Interactive Canvas */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Top Controls Overlay */}
          <div className="flex items-center justify-between gap-2 z-10 pb-2">
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-xl">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {lang === 'ar'
                  ? `زاوية العرض: (${Math.round(angleX)}° , ${Math.round(angleY)}°)`
                  : `Angles : (${Math.round(angleX)}°, ${Math.round(angleY)}°)`}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoom(prev => Math.min(2.0, prev + 0.15))}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
                title="Zoom +"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.15))}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
                title="Zoom -"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={resetCamera}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer flex items-center gap-1 text-xs"
                title={lang === 'ar' ? 'إعادة ضبط زاوية الرؤية' : 'Réinitialiser la vue'}
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">{lang === 'ar' ? 'إعادة ضبط' : 'Reset'}</span>
              </button>
            </div>
          </div>

          {/* Canvas Element with mouse rotation */}
          <div className="flex-1 w-full min-h-[400px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none relative">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full block rounded-xl touch-none"
            />

            <div className="absolute bottom-2 right-2 pointer-events-none text-[11px] text-slate-500 bg-slate-950/70 px-2.5 py-1 rounded-md">
              {lang === 'ar' ? 'انقر واسحب بالفأرة للتدوير 3D' : 'Glissez pour tourner'}
            </div>
          </div>
        </div>

        {/* Right: Analytical Parameters & KaTeX Formulas */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'ar' ? 'الضوابط البارامترية والمعادلات:' : 'Paramètres & Formules Analytiques :'}</span>
            </h3>

            {scenario === 'sphere_plane' && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-300">{lang === 'ar' ? 'شعاع الفلكة R:' : 'Rayon de la sphère R :'}</span>
                    <span className="font-mono text-indigo-400">{sphereRadius}</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    value={sphereRadius}
                    onChange={e => setSphereRadius(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-300">{lang === 'ar' ? 'المسافة d(Ω, (P)):' : 'Distance d(Ω, (P)) :'}</span>
                    <span className="font-mono text-cyan-400">{planeDistance}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="110"
                    value={planeDistance}
                    onChange={e => setPlaneDistance(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    {lang === 'ar' ? 'صيغة حساب المسافة الرسمية:' : 'Formule de la Distance au Plan :'}
                  </span>
                  <FormulaDisplay formula="d(\\Omega, (P)) = \\frac{|a x_\\Omega + b y_\\Omega + c z_\\Omega + d|}{\\sqrt{a^2 + b^2 + c^2}}" className="text-xs py-1" />
                  <p className={`font-bold mt-2 ${intersectionState.color}`}>
                    {intersectionState.text}
                  </p>
                </div>
              </div>
            )}

            {scenario === 'cross_product' && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-300">{lang === 'ar' ? 'الزاوية بين المتجهتين (u⃗, v⃗):' : 'Angle (u⃗, v⃗) :'}</span>
                    <span className="font-mono text-indigo-400">{vectorAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="165"
                    value={vectorAngle}
                    onChange={e => setVectorAngle(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    {lang === 'ar' ? 'خاصية المتجه المنظمي (Orthogonalité):' : 'Propriété du Produit Vectoriel :'}
                  </span>
                  <FormulaDisplay formula="\\vec{n} = \\vec{u} \\wedge \\vec{v} \\implies \\vec{n} \\perp \\vec{u} \\quad \\text{et} \\quad \\vec{n} \\perp \\vec{v}" className="text-xs py-1" />
                  <p className="text-slate-300 text-[11px] leading-relaxed pt-1">
                    {lang === 'ar'
                      ? 'الجداء المتجهي يعطي متجهاً عمودياً على المستوى المحدد بـ u⃗ و v⃗، ومعياره يمثل مساحة متوازي الأضلاع.'
                      : 'Le produit vectoriel est normal au plan (u, v) et sa norme est égale à l\'aire du parallélogramme.'}
                  </p>
                </div>
              </div>
            )}

            {scenario === 'point_projections' && (
              <div className="space-y-3 text-xs">
                {(['x', 'y', 'z'] as const).map(coord => (
                  <div key={coord}>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-300 font-mono">{coord.toUpperCase()} :</span>
                      <span className="font-mono text-emerald-400">{pointCoords[coord]}</span>
                    </div>
                    <input
                      type="range"
                      min="-90"
                      max="90"
                      value={pointCoords[coord]}
                      onChange={e => setPointCoords(prev => ({ ...prev, [coord]: Number(e.target.value) }))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                ))}

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    {lang === 'ar' ? 'المسافة بين نقطتين في الفضاء:' : 'Distance entre deux points :'}
                  </span>
                  <FormulaDisplay formula="OM = \\sqrt{x^2 + y^2 + z^2}" className="text-xs py-1" />
                  <p className="font-mono text-emerald-300 text-xs">
                    OM = {Math.round(Math.sqrt(pointCoords.x ** 2 + pointCoords.y ** 2 + pointCoords.z ** 2))} u
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Interactive 3D Spatial Mission (Phase 3) */}
          <div className="bg-emerald-950/25 border border-emerald-500/40 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold text-emerald-300 flex items-center gap-1">
                <span>🎯</span>
                <span>
                  {lang === 'ar'
                    ? 'تحدي الهندسة الفضائية التطبيقي'
                    : 'Défi Pratique de Géométrie Spatiale'}
                </span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
                {completed3DMissions[scenario] ? (lang === 'ar' ? '✓ منجز' : '✓ Validé') : '+40 XP'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {scenario === 'sphere_plane'
                ? lang === 'ar'
                  ? 'اضبط الشعاع R والمسافة d(Ω, (P)) بحيث يصبح المستوى (P) مماساً تماماً للفلكة (S) (أي d = R).'
                  : 'Ajustez R et d(Ω, (P)) pour que le plan (P) soit tangent à la sphère (S) (d = R).'
                : scenario === 'cross_product'
                ? lang === 'ar'
                  ? 'اضبط الزاوية بين المتجهتين (u⃗, v⃗) لتكون مساحة متوازي الأضلاع ||u⃗ ∧ v⃗|| قصوية (تعامد المتجهتين 90°).'
                  : 'Ajustez l\'angle (u⃗, v⃗) à 90° pour maximiser la norme du produit vectoriel ||u⃗ ∧ v⃗||.'
                : lang === 'ar'
                ? 'اضبط الإحداثيات (X, Y, Z) بحيث تقع النقطة M على الفلكة التي مركزها O وشعاعها 50 (أي OM = 50).'
                : 'Ajustez (X, Y, Z) pour que le point M soit à une distance OM = 50 de l\'origine O.'}
            </p>
            <div className="flex flex-col gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  let success = false;
                  let feedbackText = '';
                  if (scenario === 'sphere_plane') {
                    success = sphereRadius === planeDistance;
                    feedbackText = success
                      ? lang === 'ar'
                        ? `ممتاز! عندما d(Ω,(P)) = R = ${sphereRadius} يكون المستوى مماساً للفلكة في نقطة وحيدة H (+40 XP).`
                        : `Parfait ! Pour d(Ω,(P)) = R = ${sphereRadius}, le plan est tangent à la sphère (+40 XP).`
                      : lang === 'ar'
                      ? `حالياً d = ${planeDistance} و R = ${sphereRadius}. اجعل المسافة مساوية تماماً للشعاع!`
                      : `Actuellement d = ${planeDistance} et R = ${sphereRadius}. Égalisez d et R !`;
                  } else if (scenario === 'cross_product') {
                    success = vectorAngle === 90;
                    feedbackText = success
                      ? lang === 'ar'
                        ? 'أحسنت! عند الزاوية 90° يكون sin(90°) = 1 وتبلغ مساحة متوازي الأضلاع قيمتها القصوية (+40 XP).'
                        : 'Bravo ! À 90°, sin(90°) = 1 et la norme du produit vectoriel est maximale (+40 XP).'
                      : lang === 'ar'
                      ? `الزاوية الحالية ${vectorAngle}°. تذكر أن sin(θ) يبلغ قيمته القصوية عند التعامد 90°!`
                      : `Angle actuel : ${vectorAngle}°. Cherchez l'angle qui maximise sin(θ) !`;
                  } else {
                    const dist = Math.round(
                      Math.sqrt(pointCoords.x ** 2 + pointCoords.y ** 2 + pointCoords.z ** 2)
                    );
                    success = Math.abs(dist - 50) <= 1;
                    feedbackText = success
                      ? lang === 'ar'
                        ? `رائع! المسافة OM = ${dist} u تحقق معادلة الفلكة x² + y² + z² = 50² (+40 XP).`
                        : `Excellent ! OM = ${dist} u vérifie l'équation de la sphère (+40 XP).`
                      : lang === 'ar'
                      ? `المسافة الحالية OM = ${dist} u ≠ 50 (جرب مثلاً X=30, Y=40, Z=0).`
                      : `Distance actuelle OM = ${dist} u ≠ 50 (essayez par ex. X=30, Y=40, Z=0).`;
                  }

                  if (success) {
                    soundFeedback.playCorrectSound();
                    if (!completed3DMissions[scenario]) {
                      setCompleted3DMissions(prev => ({ ...prev, [scenario]: true }));
                      onLabChallengeCompleted?.(40, 30);
                    }
                  } else {
                    soundFeedback.playIncorrectSound();
                  }
                  setMissionFeedback({ ok: success, msg: feedbackText });
                }}
                className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'تحقق من وضعية الفضاء ثلاثي الأبعاد' : 'Valider la Configuration 3D'}
              </button>
              {missionFeedback && (
                <p
                  className={`text-[11px] font-bold leading-snug ${
                    missionFeedback.ok ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {missionFeedback.msg}
                </p>
              )}
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-3 text-[11px] text-indigo-300 leading-relaxed">
            <strong>{lang === 'ar' ? 'توجيه المفتش:' : 'Conseil de l\'Inspecteur :'}</strong>{' '}
            {lang === 'ar'
              ? 'الهندسة الفضائية في الامتحان الوطني تتطلب دائماً إبراز المتجه المنظمي وتوظيف صيغة المسافة بدقة.'
              : 'En examen national, justifiez toujours la perpendicularité via le produit scalaire ou vectoriel.'}
          </div>
        </div>
      </div>
    </div>
  );
};
