import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './views/Layout'
import Puzzle from './views/Puzzle'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Puzzle /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
