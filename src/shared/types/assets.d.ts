// 번들 이미지 에셋(png) 모듈 타입 — metro 가 정적 import 를 에셋 모듈(등록 id)로 변환한다.
// expo/tsconfig.base 는 png 를 선언하지 않아 여기서 앰비언트로 보강(도메인 0 인프라 타입).
declare module '*.png' {
  const asset: number;
  export default asset;
}
