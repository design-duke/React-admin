import {
  Cartesian3,
  Cartographic,
  Math,
  Cartesian2,
  Viewer,
  SceneTransforms,
  EllipsoidGeodesic,
  Ellipsoid,
  PositionProperty,
  VelocityOrientationProperty,
} from "cesium";
import * as turf from "@turf/turf";

/**
 * ==============================
 * 经纬度高程 ↔ 笛卡尔坐标（ECEF）
 * ==============================
 */

/**
 * 将经纬度高程（度）转换为 Cartesian3（地心直角坐标）
 */
export const degreesToCartesian = (
  longitude: number,
  latitude: number,
  height: number = 0
): Cartesian3 => {
  return Cartesian3.fromDegrees(longitude, latitude, height);
};

/**
 * 将弧度经纬度高程转换为 Cartesian3
 */
export const radiansToCartesian = (
  longitude: number,
  latitude: number,
  height: number = 0
): Cartesian3 => {
  return Cartesian3.fromRadians(longitude, latitude, height);
};

/**
 * 将 Cartesian3 转换为 [经度, 纬度, 高度]（单位：度, 度, 米）
 */
export function cartesianToDegrees(
  cartesian: Cartesian3
): [number, number, number] {
  const cartographic = Cartographic.fromCartesian(cartesian);
  return [
    Math.toDegrees(cartographic.longitude),
    Math.toDegrees(cartographic.latitude),
    cartographic.height,
  ];
}

/**
 * 将 Cartesian3 转换为 [经度, 纬度, 高度]（单位：弧度, 弧度, 米）
 */
export function cartesianToRadians(
  cartesian: Cartesian3
): [number, number, number] {
  // 注意：Cartographic 的 longitude 和 latitude 默认就是弧度
  // 制图学上经纬度通常使用度表示，但 Cesium 内部使用弧度进行计算，因此 Cartographic 的 longitude 和 latitude 属性默认就是弧度。
  const cartographic = Cartographic.fromCartesian(cartesian);
  return [cartographic.longitude, cartographic.latitude, cartographic.height];
}

/**
 * ==============================
 * 屏幕坐标 ↔ 世界坐标（Cartesian3）
 * ==============================
 */

/**
 * 将屏幕像素坐标（x, y）转换为世界坐标（Cartesian3）
 * @param viewer Viewer 实例
 * @param windowPosition 屏幕坐标 { x, y }
 * @returns Cartesian3 | undefined（可能为 undefined，如点击天空）
 */
export function windowToCartesian3(
  viewer: Viewer,
  windowPosition: Cartesian2
): Cartesian3 | undefined {
  const ray = viewer.camera.getPickRay(windowPosition);
  if (!ray) return undefined;
  return viewer.scene.globe.pick(ray, viewer.scene);
}

/**
 * 将世界坐标（Cartesian3）转换为屏幕像素坐标
 * @param viewer Viewer 实例
 * @param cartesian 世界坐标
 * @returns { x: number; y: number } | undefined
 */
export function cartesian3ToWindowCoordinates(
  viewer: Viewer,
  cartesian: Cartesian3
): { x: number; y: number } | undefined {
  return SceneTransforms.worldToWindowCoordinates(viewer.scene, cartesian);
}

/**
 * ==============================
 * 距离与角度计算
 * ==============================
 */

/**
 * 计算两点间（WGS84）的直线距离（米）
 */
export function computeDistance(
  point1: [number, number, number?], // [lon, lat, height?]
  point2: [number, number, number?]
): number {
  const cart1 = Cartesian3.fromDegrees(point1[0], point1[1], point1[2] ?? 0);
  const cart2 = Cartesian3.fromDegrees(point2[0], point2[1], point2[2] ?? 0);
  return Cartesian3.distance(cart1, cart2);
}

/**
 * 计算两点间的地面距离（沿椭球面，米）
 */
export function computeGeodesicDistance(
  point1: [number, number],
  point2: [number, number]
): number {
  const carto1 = Cartographic.fromDegrees(point1[0], point1[1]);
  const carto2 = Cartographic.fromDegrees(point2[0], point2[1]);
  const geodesic = new EllipsoidGeodesic(carto1, carto2, Ellipsoid.WGS84);
  return geodesic.surfaceDistance; // 单位：米
}

/**
 * 计算从起点到终点的方位角（正北为0°，顺时针，单位：度）
 */
export function computeHeading(
  origin: [number, number],
  destination: [number, number]
): number {
  const carto1 = Cartographic.fromDegrees(origin[0], origin[1]);
  const carto2 = Cartographic.fromDegrees(destination[0], destination[1]);

  const geodesic = new EllipsoidGeodesic(carto1, carto2, Ellipsoid.WGS84);
  const headingRad = geodesic.startHeading; // 弧度，从起点看向终点的初始方位角
  let headingDeg = Math.toDegrees(headingRad);

  // 确保结果在 [0, 360) 范围内
  if (headingDeg < 0) {
    headingDeg += 360;
  }
  return headingDeg;
}

/**
 * 创建带方向的朝向（用于模型始终朝前）
 * @param positionProperty SampledPositionProperty 或 PositionProperty
 * @returns OrientationProperty
 */
export function createVelocityOrientation(
  positionProperty: PositionProperty
): VelocityOrientationProperty {
  return new VelocityOrientationProperty(positionProperty);
}

/**
 * 格式化经纬度为字符串（保留6位小数）
 */
export function formatLonLat(lon: number, lat: number): string {
  return `${lon.toFixed(6)}, ${lat.toFixed(6)}`;
}

/**
 * 判断点是否在多边形内（使用射线法）
 * @param point [lon, lat]
 * @param polygon [[lon, lat], ...]
 */
export function isPointInPolygon(
  point: [number, number],
  polygon: [number, number][]
): boolean {
  // 注意：Turf 使用 [lon, lat] 顺序，且不闭合（自动处理）
  const pt = turf.point(point);
  // 确保多边形是闭合的（首尾相同），Turf 要求外部环为逆时针
  const polyCoords = [...polygon];
  if (
    polyCoords[0][0] !== polyCoords[polyCoords.length - 1][0] ||
    polyCoords[0][1] !== polyCoords[polyCoords.length - 1][1]
  ) {
    polyCoords.push(polyCoords[0]); // 闭合
  }
  const poly = turf.polygon([polyCoords]);
  return turf.booleanPointInPolygon(pt, poly);
}

/**
 * 获取当前相机中心点的经纬度
 */
export function getCameraCenter(
  viewer: Viewer
): [number, number, number] | null {
  const center = viewer.camera.pickEllipsoid(
    new Cartesian2(
      viewer.canvas.clientWidth / 2,
      viewer.canvas.clientHeight / 2
    )
  );
  if (!center) return null;
  return cartesianToDegrees(center);
}
