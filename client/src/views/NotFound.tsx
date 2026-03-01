import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
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
      <Typography variant="h1" color="text.secondary" fontWeight={500}>
        404
      </Typography>
      <Typography variant="h6" color="text.secondary" fontWeight={400}>
        Page not found
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button
        variant="outlined"
        onClick={() => navigate('/')}
        sx={{ mt: 2, color: 'text.secondary', borderColor: 'divider' }}
      >
        Go home
      </Button>
    </Box>
  )
}
