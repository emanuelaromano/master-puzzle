import { Box, Button, Typography } from '@mui/material'
import { Calendar, CircleCheck, Globe, RefreshCw, User } from 'lucide-react'
import { usePuzzle } from '../hooks/usePuzzle.tsx'

const detailIconSize = 18

export default function Congrats() {
  const { metObject, newSeed, newSeedLoading } = usePuzzle()

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        p: 3,
        textAlign: 'center',
      }}
    >
      <CircleCheck
        size={64}
        strokeWidth={1}
        style={{ color: '#22c55e' }}
        aria-hidden
      />
      {metObject?.title && (
        <Typography variant="h6" component="p" sx={{ fontWeight: 500, textAlign: 'center' }}>
          {metObject.title}
        </Typography>
      )}
      {metObject && (
        <Box
          sx={{
            minWidth: 320,
            maxWidth: 460,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            gap: 1.5,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start', textAlign: 'left' }}>
            {metObject.artistDisplayName && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                <User size={detailIconSize} style={{ flexShrink: 0 }} aria-hidden />
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Artist: <b>{metObject.artistDisplayName}</b>
                </Typography>
              </Box>
            )}
            {metObject.country && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                <Globe size={detailIconSize} style={{ flexShrink: 0 }} aria-hidden />
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Country: <b>{metObject.country}</b>
                </Typography>
              </Box>
            )}
            {metObject.objectDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                <Calendar size={detailIconSize} style={{ flexShrink: 0 }} aria-hidden />
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Date: <b>{metObject.objectDate}</b>
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
      <Button
        type="button"
        variant="outlined"
        size="small"
        onClick={newSeed}
        disabled={newSeedLoading}
        sx={{ color: 'black', borderColor: 'divider' }}
        startIcon={<RefreshCw size={16} />}
      >
        Try another
      </Button>
    </Box>
  )
}
