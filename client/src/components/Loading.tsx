import { Box, CircularProgress, Typography } from '@mui/material'

type LoadingProps = {
  show: boolean
  message: string
}

export default function Loading({ show, message }: LoadingProps) {
  if (!show) return null

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        bgcolor: 'background.default',
        zIndex: 1,
      }}
    >
      <CircularProgress sx={{ color: 'text.secondary' }} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  )
}
