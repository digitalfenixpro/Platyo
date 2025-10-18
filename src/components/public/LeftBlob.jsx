export default function LeftBlob({ color = '#FFC800', width = 300, height = 600 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 285 538"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute top-0 left-0 opacity-80 pointer-events-none"
      style={{
        transform: 'translate(-20%, -20%)',
        borderBottomRightRadius: '50% 40%',
      }}
    >
      <path
        d="M0 0C45 25 120 25 160 50C200 75 205 140 180 200C155 260 160 320 165 380C170 440 160 520 70 538C30 545 10 520 0 515V0Z"
        fill={color}
      />
    </svg>
  );
}
