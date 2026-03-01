export function puzzleAreaSx(workW: number, workH: number) {
  const isLandscape = workW >= workH
  return {
    aspectRatio: `${workW} / ${workH}`,
    ...(isLandscape
      ? {
          width: '100%',
          height: 'auto',
          maxHeight: '100%',
        }
      : {
          height: '100%',
          width: 'auto',
          maxWidth: '100%',
        }),
  } as const
}
