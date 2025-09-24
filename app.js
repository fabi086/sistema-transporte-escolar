// Configuração do Supabase
const supabaseUrl = 'https://qtvjrkgjmpbypmjhhkyg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dmpya2dqbXBieXBtamhoa3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzY0NDAsImV4cCI6MjA3NDI1MjQ0MH0.N7TJueloFMgrM-wsSi0h0nZlD1qy0QDR6pIQsJii2kI'

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)
let currentUser = null
let revenueChart = null
let attendanceChart = null

console.log('🚌 Dashboard Profissional carregado!')

// ===============================
// NAVEGAÇÃO E UI
// ===============================
function mostrarSecao(secao) {
    console.log('Mostrando seção:', secao)
    
    // Esconder todas as seções
    const secoes = ['dashboard', 'alunos', 'presenca', 'motoristas', 'financeiro', 'relatorios']
    secoes.forEach(s => {
        const elemento = document.getElementById(`secao-${s}`)
        if (elemento) {
            elemento.style.display = 'none'
        }
    })
    
    // Remover active dos nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active', 'bg-blue-50', 'text-blue-600')
        item.classList.add('text-gray-700')
    })
    
    // Mostrar seção selecionada
    const secaoAtiva = document.getElementById(`secao-${secao}`)
    if (secaoAtiva) {
        secaoAtiva.style.display = 'block'
    }
    
    // Ativar nav item
    event.target.closest('.nav-item').classList.add('active', 'bg-blue-50', 'text-blue-600')
    event.target.closest('.nav-item').classList.remove('text-gray-700')
    
    // Atualizar título da página
    const titulos = {
        dashboard: 'Dashboard',
        alunos: 'Gestão de Alunos',
        presenca: 'Lista de Presença',
        motoristas: 'Gestão de Motoristas',
        financeiro: 'Controle Financeiro',
        relatorios: 'Relatórios'
    }
    document.getElementById('page-title').textContent = titulos[secao] || 'Dashboard'
    
    // Carregar dados específicos
    if (secao === 'dashboard') {
        loadDashboard()
    }
}

// Sidebar toggle
document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebar-toggle')
    const sidebar = document.getElementById('sidebar')
    const overlay = document.getElementById('mobile-overlay')
    
    sidebarToggle?.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-open')
        overlay.classList.toggle('hidden')
    })
    
    overlay?.addEventListener('click', function() {
        sidebar.classList.remove('mobile-open')
        overlay.classList.add('hidden')
    })
    
    // Inicializar dashboard
    loadDashboard()
})

// ===============================
// DASHBOARD DATA
// ===============================
async function loadDashboard() {
    console.log('Carregando dashboard...')
    
    try {
        // Simular dados (você pode conectar com Supabase depois)
        const totalAlunos = 28
        const presentesHoje = 24
        const receitaMensal = 4200
        const totalMotoristas = 3
        
        // Atualizar métricas
        document.getElementById('total-alunos').textContent = totalAlunos
        document.getElementById('presentes-hoje').textContent = presentesHoje
        document.getElementById('receita-mensal').textContent = `R$ ${receitaMensal.toLocaleString()}`
        document.getElementById('total-motoristas').textContent = totalMotoristas
        
        // Criar gráficos
        createRevenueChart()
        createAttendanceChart()
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error)
    }
}

function createRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d')
    
    if (revenueChart) {
        revenueChart.destroy()
    }
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Receita Diária',
                data: [580, 620, 590, 650, 700, 480, 520],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            elements: {
                point: {
                    hoverRadius: 8
                }
            }
        }
    })
}

function createAttendanceChart() {
    const ctx = document.getElementById('attendanceChart').getContext('2d')
    
    if (attendanceChart) {
        attendanceChart.destroy()
    }
    
    attendanceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Presentes', 'Ausentes', 'Atrasados'],
            datasets: [{
                data: [24, 3, 1],
                backgroundColor: [
                    '#11998e',
                    '#f5576c',
                    '#f093fb'
                ],
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    })
}

// ===============================
// FUNCIONALIDADES BÁSICAS
// ===============================
function logout() {
    if (confirm('Deseja sair do sistema?')) {
        alert('Logout realizado!')
        // Aqui você pode redirecionar ou limpar dados
    }
}

// Adicionar efeitos visuais
document.addEventListener('DOMContentLoaded', function() {
    // Animação dos cards
    const cards = document.querySelectorAll('.card')
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0'
            card.style.transform = 'translateY(20px)'
            card.style.transition = 'all 0.5s ease'
            
            setTimeout(() => {
                card.style.opacity = '1'
                card.style.transform = 'translateY(0)'
            }, 100)
        }, index * 100)
    })
})
