import { Box, Divider } from '@mui/material'
import { usePuzzle } from '../hooks/usePuzzle.tsx'
import Pieces from '../components/Pieces'
import Congrats from '../components/Congrats'
import Image from '../components/Image'
import Loading from '../components/Loading'
import Error from './Error'

export default function Puzzle() {
  const { metObject, puzzleGrid, pieceError, placedSlots, newSeed, newSeedLoading } = usePuzzle()
  const isComplete =
    puzzleGrid != null && placedSlots.size > 0 && placedSlots.size === puzzleGrid.cells.length

  if (pieceError) {
    return (
      <Error
        message={pieceError}
        onRetry={newSeed}
        retryLoading={newSeedLoading}
      />
    )
  }

  const showLoading =
    !metObject ||
    newSeedLoading ||
    (Boolean(metObject) && puzzleGrid === null)
  const loadingMessage = !metObject
    ? 'Loading artwork…'
    : newSeedLoading
      ? 'Loading next puzzle…'
      : 'Fetching work of art…'

  return (
    <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          gap: 3,
          p: 3,
          minHeight: 0,
          height: 'calc(100vh - 56px)',
          maxWidth: 1600,
          mx: 'auto',
          width: '100%',
        }}
      >
        <Box sx={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {isComplete ? <Congrats /> : <Pieces />}
        </Box>
        <Divider orientation="vertical" flexItem sx={{ borderLeftWidth: '1px' }} />
        <Box sx={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Image />
        </Box>
      </Box>
      <Loading show={showLoading} message={loadingMessage} />
    </Box>
  )
}
