import React from 'react'
import { Link } from 'react-router-dom'

export default function CustomerHeader() {
  return (
    <header className="header">
      <div className="container nav">
        <Link to="/"><img className="logo" alt="Papas Queen's" src="https://tofuu.getjusto.com/orioneat-local/resized2/W2N3u38SAkY8yFaNM-x-300.webp" /></Link>
        <nav style={{ marginLeft: 'auto', display: 'flex', gap: '.5rem' }}>
          <Link className="btn" to="/track">Rastrear pedido</Link>
        </nav>
      </div>
    </header>
  )
}
