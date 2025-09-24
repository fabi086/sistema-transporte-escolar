// Configuração do Supabase
const supabaseUrl = 'https://qtvjrkgjmpbypmjhhkyg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dmpya2dqbXBieXBtamhoa3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzY0NDAsImV4cCI6MjA3NDI1MjQ0MH0.N7TJueloFMgrM-wsSi0h0nZlD1qy0QDR6pIQsJii2kI'

// Inicializar Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)
let currentUser = null

console.log('🚌 Sistema carregado! Testando conexão...')

// ===============================
// SISTEMA DE NOTIFICAÇÕES SIMPLES
// ===============================
function showNotification(message, type = 'info') {
    alert(message) // Por enquanto, vamos usar alert simples
}

// ===============================
// LOGIN
// ===============================
async function login() {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    
    console.log('Tentando login com:', email)
    
    if (!email || !password) {
        alert('❌ Preencha email e senha!')
        return
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })
        
        if (error) {
            alert('❌ Erro no login: ' + error.message)
            console.error('Erro login:', error)
        } else {
            currentUser = data.user
            document.getElementById('user-email').textContent = data.user.email
            document.getElementById('login-section').classList.add('hidden')
            document.getElementById('dashboard').classList.remove('hidden')
            document.getElementById('user-info').classList.remove('hidden')
            
            alert('✅ Login realizado com sucesso!')
            showSection('home')
            loadDashboard()
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
        console.error('Erro:', error)
    }
}

async function logout() {
    await supabase.auth.signOut()
    currentUser = null
    document.getElementById('login-section').classList.remove('hidden')
    document.getElementById('dashboard').classList.add('hidden')
    document.getElementById('user-info').classList.add('hidden')
    
    document.getElementById('email').value = ''
    document.getElementById('password').value = ''
}

// ===============================
// NAVEGAÇÃO
// ===============================
function showSection(section) {
    console.log('Mostrando seção:', section)
    
    // Remover classe active de todos os botões
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active')
    })
    
    // Esconder todas as seções
    const sections = document.querySelectorAll('.section')
    sections.forEach(s => s.classList.add('hidden'))
    
    const dashboardHome = document.getElementById('dashboard-home')
    
    if (section === 'home') {
        dashboardHome.classList.remove('hidden')
        loadDashboard()
        document.querySelector('button[onclick="showSection(\'home\')"]')?.classList.add('active')
    } else {
        dashboardHome.classList.add('hidden')
        const targetSection = document.getElementById(`section-${section}`)
        if (targetSection) {
            targetSection.classList.remove('hidden')
            document.querySelector(`button[onclick="showSection('${section}')"]`)?.classList.add('active')
            
            // Carregar dados específicos
            switch(section) {
                case 'alunos':
                    listarAlunos()
                    break
                case 'presenca':
                    inicializarPresenca()
                    break
                case 'motoristas':
                    listarMotoristas()
                    break
                case 'financeiro':
                    listarMensalidades()
                    break
                case 'ocorrencias':
                    carregarAlunosOcorrencia()
                    listarOcorrencias()
                    break
            }
        }
    }
}

// ===============================
// DASHBOARD
// ===============================
async function loadDashboard() {
    console.log('Carregando dashboard...')
    try {
        // Total de alunos
        const { data: alunos, error } = await supabase
            .from('alunos')
            .select('*')
            .eq('status', 'ativo')
        
        if (error) {
            console.error('Erro ao buscar alunos:', error)
        } else {
            document.getElementById('total-alunos-dash').textContent = alunos?.length || 0
            console.log('Total alunos:', alunos?.length || 0)
        }
        
        // Outros números do dashboard
        document.getElementById('presentes-hoje-dash').textContent = '0'
        document.getElementById('total-motoristas-dash').textContent = '0' 
        document.getElementById('receita-mensal-dash').textContent = 'R$ 0'
        
    } catch (error) {
        console.error('Erro dashboard:', error)
    }
}

// ===============================
// CADASTRAR ALUNO SIMPLIFICADO
// ===============================
async function cadastrarAluno() {
    console.log('Cadastrando aluno...')
    
    const nome = document.getElementById('nome-aluno')?.value?.trim()
    const escola = document.getElementById('escola-aluno')?.value?.trim()
    const responsavel = document.getElementById('nome-responsavel')?.value?.trim()
    const telefone = document.getElementById('telefone-responsavel')?.value?.trim()
    const embarque = document.getElementById('local-embarque')?.value?.trim()
    
    console.log('Dados:', { nome, escola, responsavel, telefone, embarque })
    
    if (!nome || !escola || !responsavel) {
        alert('❌ Preencha pelo menos: Nome, Escola e Responsável!')
        return
    }
    
    const dados = {
        nome: nome,
        escola: escola,
        nome_responsavel: responsavel,
        telefone_responsavel: telefone,
        local_embarque: embarque,
        endereco: document.getElementById('endereco-aluno')?.value?.trim() || '',
        valor_mensalidade: parseFloat(document.getElementById('valor-mensalidade')?.value) || 150.00,
        status: 'ativo'
    }
    
    try {
        const { data, error } = await supabase
            .from('alunos')
            .insert([dados])
        
        if (error) {
            alert('❌ Erro ao cadastrar: ' + error.message)
            console.error('Erro:', error)
        } else {
            alert('✅ Aluno cadastrado com sucesso!')
            console.log('Aluno cadastrado:', data)
            
            // Limpar campos
            document.getElementById('nome-aluno').value = ''
            document.getElementById('escola-aluno').value = ''
            document.getElementById('nome-responsavel').value = ''
            document.getElementById('telefone-responsavel').value = ''
            document.getElementById('local-embarque').value = ''
            
            listarAlunos()
            loadDashboard()
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
        console.error('Erro:', error)
    }
}

// ===============================
// LISTAR ALUNOS SIMPLIFICADO
// ===============================
async function listarAlunos() {
    console.log('Listando alunos...')
    
    try {
        const { data, error } = await supabase
            .from('alunos')
            .select('*')
            .eq('status', 'ativo')
            .order('nome', { ascending: true })
        
        if (error) {
            alert('❌ Erro ao buscar alunos: ' + error.message)
            console.error('Erro:', error)
            return
        }
        
        console.log('Alunos encontrados:', data?.length || 0)
        
        const listaDiv = document.getElementById('lista-alunos')
        if (!listaDiv) {
            console.error('Elemento lista-alunos não encontrado!')
            return
        }
        
        if (data && data.length > 0) {
            let html = ''
            data.forEach(aluno => {
                html += `
                    <div class="border rounded-lg p-4 mb-3 bg-blue-50">
                        <h4 class="font-bold">${aluno.nome}</h4>
                        <p class="text-gray-600">🏫 ${aluno.escola}</p>
                        <p class="text-gray-600">👤 ${aluno.nome_responsavel || 'N/I'}</p>
                        <p class="text-gray-600">📞 ${aluno.telefone_responsavel || 'N/I'}</p>
                        <p class="text-green-600">💰 R$ ${parseFloat(aluno.valor_mensalidade || 0).toFixed(2)}</p>
                        <div class="mt-2">
                            <button onclick="excluirAluno(${aluno.id})" class="bg-red-500 text-white px-3 py-1 rounded text-sm">
                                🗑️ Excluir
                            </button>
                        </div>
                    </div>
                `
            })
            listaDiv.innerHTML = html
        } else {
            listaDiv.innerHTML = '<p class="text-center text-gray-500 py-4">Nenhum aluno cadastrado.</p>'
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
        console.error('Erro:', error)
    }
}

async function excluirAluno(id) {
    if (!confirm('Excluir este aluno?')) return
    
    try {
        const { error } = await supabase
            .from('alunos')
            .update({ status: 'inativo' })
            .eq('id', id)
        
        if (error) {
            alert('❌ Erro ao excluir: ' + error.message)
        } else {
            alert('✅ Aluno excluído!')
            listarAlunos()
            loadDashboard()
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

// ===============================
// BUSCAR ALUNOS
// ===============================
async function buscarAlunos() {
    const termo = document.getElementById('buscar-aluno')?.value?.toLowerCase()?.trim()
    
    if (!termo) {
        listarAlunos()
        return
    }
    
    console.log('Buscando:', termo)
    // Por enquanto, usar a lista normal
    listarAlunos()
}

// ===============================
// FUNCÕES VAZIAS (para não dar erro)
// ===============================
function inicializarPresenca() {
    const hoje = new Date().toISOString().split('T')[0]
    if (document.getElementById('data-presenca')) {
        document.getElementById('data-presenca').value = hoje
    }
    document.getElementById('lista-presenca').innerHTML = '<p class="text-center py-4">Selecione data e turno, depois clique em Carregar</p>'
}

function carregarListaPresenca() {
    alert('🔧 Funcionalidade em desenvolvimento!')
}

function salvarPresenca() {
    alert('🔧 Funcionalidade em desenvolvimento!')
}

async function listarMotoristas() {
    document.getElementById('lista-motoristas').innerHTML = '<p class="text-center py-4">Funcionalidade em desenvolvimento</p>'
}

async function cadastrarMotorista() {
    alert('🔧 Funcionalidade em desenvolvimento!')
}

async function listarMensalidades() {
    document.getElementById('lista-mensalidades').innerHTML = '<p class="text-center py-4">Funcionalidade em desenvolvimento</p>'
}

async function gerarMensalidades() {
    alert('🔧 Funcionalidade em desenvolvimento!')
}

async function carregarAlunosOcorrencia() {
    console.log('Carregando alunos para ocorrência...')
}

async function listarOcorrencias() {
    if (document.getElementById('lista-ocorrencias')) {
        document.getElementById('lista-ocorrencias').innerHTML = '<p class="text-center py-4">Funcionalidade em desenvolvimento</p>'
    }
}

async function registrarOcorrencia() {
    alert('🔧 Funcionalidade em desenvolvimento!')
}

// ===============================
// INICIALIZAÇÃO
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema iniciado!')
    
    // Verificar elementos importantes
    const elementos = ['email', 'password', 'login-section', 'dashboard']
    elementos.forEach(id => {
        const el = document.getElementById(id)
        console.log(`Elemento ${id}:`, el ? '✅ Encontrado' : '❌ Não encontrado')
    })
    
    // Verificar usuário logado
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            console.log('Usuário já logado:', session.user.email)
            currentUser = session.user
            document.getElementById('user-email').textContent = session.user.email
            document.getElementById('login-section').classList.add('hidden')
            document.getElementById('dashboard').classList.remove('hidden')
            document.getElementById('user-info').classList.remove('hidden')
            loadDashboard()
            showSection('home')
        }
    })
})
