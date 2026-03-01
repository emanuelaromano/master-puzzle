import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

import { usePuzzle } from '../hooks/usePuzzle.tsx'
import logoSrc from '../assets/image.png'

export default function Navbar() {
  const { puzzleGrid, placedSlots, newSeed, newSeedLoading } = usePuzzle()
  const isComplete =
    puzzleGrid != null && placedSlots.size > 0 && placedSlots.size === puzzleGrid.cells.length
  const isLoading = newSeedLoading || puzzleGrid == null

  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        zIndex: 10,
        height: 56,
        minHeight: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography
        component={Link}
        to="/"
        variant="body1"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          textDecoration: 'none',
          color: 'text.primary',
          fontWeight: 700,
          fontSize: '1.3rem',
        }}
      >
        <Box
          component="img"
          src={logoSrc}
          alt=""
          sx={{ height: 28, width: 'auto', display: 'block' }}
        />
        Master Puzzle
      </Typography>
      {!isComplete &&
        (isLoading ? (
          <IconButton
            aria-label="New puzzle"
            disabled
            sx={{
              color: 'text.secondary',
              opacity: 0.5,
              '&.Mui-disabled': { opacity: 0.35 },
            }}
          >
            <RefreshCw size={20} />
          </IconButton>
        ) : (
          <Tooltip title="New puzzle" placement="bottom">
            <IconButton
              aria-label="New puzzle"
              onClick={newSeed}
              sx={{
                color: 'text.secondary',
                opacity: 0.5,
                '&:hover': {
                  backgroundColor: 'transparent',
                  opacity: 0.8,
                  transition: 'opacity 0.2s ease-in-out',
                },
              }}
            >
              <RefreshCw size={20} />
            </IconButton>
          </Tooltip>
        ))}
    </Box>
  )
}
