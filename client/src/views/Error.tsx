import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

type ErrorProps = {
  message?: string
  onRetry?: () => void
  retryLoading?: boolean
}

export default function Error({ message = 'Something went wrong.', onRetry, retryLoading = false }: ErrorProps) {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 4,
      }}
    >
      <Typography variant="h6" color="text.secondary" fontWeight={400}>
        Failed to load image
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {message}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {onRetry && (
          <Button
            variant="outlined"
            onClick={onRetry}
            disabled={retryLoading}
            sx={{ color: 'text.secondary', borderColor: 'divider' }}
          >
            {retryLoading ? 'Loading…' : 'Try again'}
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
          sx={{ color: 'text.secondary', borderColor: 'divider' }}
        >
          Go home
        </Button>
      </Box>
    </Box>
  )
}
