import { useNavigate } from 'react-router-dom'

export default function Home() {
  const nav = useNavigate()

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #03592e 0%, #047857 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)',
        opacity: 0.3
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          {/* Lado izquierdo: Texto */}
          <div>
            <h1 style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#fff',
              margin: 0,
              lineHeight: '1.1',
              marginBottom: '0.5rem'
            }}>COMBOS</h1>
            <div style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#FFD700',
              border: '3px solid #03592e',
              padding: '0.75rem 1.5rem',
              display: 'inline-block',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>FAMILIARES</div>
            <div style={{ color: '#fff', fontSize: '18px', marginBottom: '1.5rem', lineHeight: '1.6', maxWidth: '500px' }}>
              ¡HOY ES EL DÍA PARA PEDIRLAS! CON VARIEDAD DE SABORES AL MEJOR PRECIO DESDE
            </div>
            <div style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#FFD700',
              marginBottom: '2rem'
            }}>S/ 34.40</div>
            <button
              className="btn"
              onClick={() => nav('/menu')}
              style={{
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                padding: '1.25rem 2.5rem',
                borderRadius: '12px',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Comprar
            </button>
          </div>

          {/* Lado derecho: Imágenes de productos */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '1rem' }}>
            {/* Columna izquierda: Papas fritas */}
            <div style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              width: '140px'
            }}>
              <div style={{
                width: '100%',
                height: '140px',
                background: '#f0f0f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '64px'
              }}>
                🍟
              </div>
            </div>

            {/* Columna derecha: Alitas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                position: 'relative',
                width: '140px'
              }}>
                <div style={{
                  width: '100%',
                  height: '120px',
                  background: '#2d2d2d',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '56px'
                }}>
                  🍗
                </div>
                <div style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '28px' }}>👑</div>
              </div>
              <div style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                width: '140px'
              }}>
                <div style={{
                  width: '100%',
                  height: '120px',
                  background: '#2d2d2d',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '56px'
                }}>
                  🍗
                </div>
              </div>
              <div style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                width: '140px'
              }}>
                <div style={{
                  width: '100%',
                  height: '120px',
                  background: '#2d2d2d',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '56px'
                }}>
                  🍗
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '1.5rem',
        left: '2rem',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '12px'
      }}>
        Imágenes referenciales
      </div>
    </main>
  )
}
