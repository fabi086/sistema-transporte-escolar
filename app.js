// Configuração do Supabase
const supabaseUrl = 'https://qtvjrkgjmpbypmjhhkyg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dmpya2dqbXBieXBtamhoa3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzY0NDAsImV4cCI6MjA3NDI1MjQ0MH0.N7TJueloFMgrM-wsSi0h0nZlD1qy0QDR6pIQsJii2kI'

// Inicializar Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)
let currentUser = null

console.log('🚌 Sistema carregado!')

// ===============================
// FUNÇÃO AUXILIAR SEGURA
// ===============================
function setElementText(id, text) {
    const element = document.getElementById(id)
    if (element) {
        element.textContent = text
    } else {
        console.warn(`Elemento ${id} não encontrado`)
    }
}

function getElementValue(id) {
    const element = document.getElementById(id)
    return element ? element.value.trim() : ''
}

// ===============================
// LOGIN
// ===============================
async function login() {
    const email = getElementValue('email')
    const password = getElementValue('password')
    
    console.log('Login attempt:', email)
    
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
            console.error('Login error:', error)
        } else {
            currentUser = data.user
            setElementText('user-email', data.user.email)
            
            // Mostrar/esconder seções
            const loginSection = document.getElementById('login-section')
            const dashboard = document.getElementById('dashboard')
            const userInfo = document.getElementById('user-info')
            
            if (loginSection) loginSection.classList.add('hidden')
            if (dashboard) dashboard.classList.remove('hidden')
            if (userInfo) userInfo.classList.remove('hidden')
            
            alert('✅ Login realizado com sucesso!')
            showSection('home')
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
        console.error('Login error:', error)
    }
}

async function logout() {
    try {
        await supabase.auth.signOut()
        currentUser = null
        
        const loginSection = document.getElementById('login-section')
        const dashboard = document.getElementById('dashboard')
        const userInfo = document.getElementById('user-info')
        
        if (loginSection) loginSection.classList.remove('hidden')
        if (dashboard) dashboard.classList.add('hidden')
        if (userInfo) userInfo.classList.add('hidden')
        
        const emailInput = document.getElementById('email')
        const passwordInput = document.getElementById('password')
        if (emailInput) emailInput.value = ''
        if (passwordInput) passwordInput.value = ''
        
        alert('Logout realizado!')
    } catch (error) {
        console.error('Logout error:', error)
    }
}

// ===============================
// NAVEGAÇÃO
// ===============================
function showSection(section) {
    console.log('Showing section:', section)
    
    // Remover active de todos os botões
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active')
    })
    
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(s => {
        s.classList.add('hidden')
    })
    
    const dashboardHome = document.getElementById('dashboard-home')
    
    if (section === 'home') {
        if (dashboardHome) dashboardHome.classList.remove('hidden')
        loadDashboard()
        
        const homeBtn = document.querySelector('button[onclick="showSection(\'home\')"]')
        if (homeBtn) homeBtn.classList.add('active')
    } else {
        if (dashboardHome) dashboardHome.classList.add('hidden')
        
        const targetSection = document.getElementById(`section-${section}`)
        if (targetSection) {
            targetSection.classList.remove('hidden')
            
            const sectionBtn = document.querySelector(`button[onclick="showSection('${section}')"]`)
            if (sectionBtn) sectionBtn.classList.add('active')
            
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
                    listarOcorrencias()
                    break
            }
        } else {
            console.warn(`Seção ${section} não encontrada`)
        }
    }
}

// ===============================
// DASHBOARD
// ===============================
async function loadDashboard() {
    console.log('Loading dashboard...')
    
    try {
        // Total de alunos
        const { data: alunos, error } = await supabase
            .from('alunos')
            .select('*')
            .eq('status', 'ativo')
        
        if (!error && alunos) {
            setElementText('total-alunos-dash', alunos.length)
            console.log('Total alunos:', alunos.length)
        } else {
            console.error('Erro ao buscar alunos:', error)
            setElementText('total-alunos-dash', '0')
        }
        
        // Dados padrão para outros cards
        setElementText('presentes-hoje-dash', '0')
        setElementText('total-motoristas-dash', '0')
        setElementText('receita-mensal-dash', 'R$ 0')
        
    } catch (error) {
        console.error('Dashboard error:', error)
        setElementText('total-alunos-dash', '0')
        setElementText('presentes-hoje-dash', '0')
        setElementText('total-motoristas-dash', '0')
        setElementText('receita-mensal-dash', 'R$ 0')
    }
}

// ===============================
// GESTÃO DE ALUNOS
// ===============================
async function cadastrarAluno() {
    console.log('Cadastrando aluno...')
    
    const nome = getElementValue('nome-aluno')
    const escola = getElementValue('escola-aluno')
    const responsavel = getElementValue('nome-responsavel')
    const telefone = getElementValue('telefone-responsavel')
    const embarque = getElementValue('local-embarque')
    const endereco = getElementValue('endereco-aluno')
    const valor = getElementValue('valor-mensalidade')
    
    console.log('Dados coletados:', { nome, escola, responsavel, telefone, embarque })
    
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
        endereco: endereco,
        valor_mensalidade: parseFloat(valor) || 150.00,
        status: 'ativo'
    }
    
    try {
        const { data, error } = await supabase
            .from('alunos')
            .insert([dados])
        
        if (error) {
            alert('❌ Erro ao cadastrar: ' + error.message)
            console.error('Insert error:', error)
        } else {
            alert('✅ Aluno cadastrado com sucesso!')
            console.log('Aluno cadastrado:', data)
            
            // Limpar formulário
            limparFormularioAluno()
            listarAlunos()
            loadDashboard()
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
        console.error('Cadastro error:', error)
    }
}

function limparFormularioAluno() {
    const campos = [
        'nome-aluno', 'escola-aluno', 'nome-responsavel',
        'telefone-responsavel', 'local-embarque', 'endereco-aluno',
        'valor-mensalidade'
    ]
    
    campos.forEach(campo => {
        const elemento = document.getElementById(campo)
        if (elemento) elemento.value = ''
    })
}

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
            console.error('List error:', error)
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
                    <div class="border rounded-lg p-4 mb-3 bg-blue-50 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="font-bold text-lg text-gray-800 mb-2">
                                    <i class="fas fa-user-graduate mr-2 text-blue-500"></i>
                                    ${aluno.nome}
                                </h4>
                                <div class="space-y-1 text-sm">
                                    <p class="text-gray-600">
                                        <i class="fas fa-school mr-2 text-green-500"></i>
                                        <strong>Escola:</strong> ${aluno.escola}
                                    </p>
                                    ${aluno.nome_responsavel ? `
                                        <p class="text-gray-600">
                                            <i class="fas fa-user-friends mr-2 text-purple-500"></i>
                                            <strong>Responsável:</strong> ${aluno.nome_responsavel}
                                        </p>
                                    ` : ''}
                                    ${aluno.telefone_responsavel ? `
                                        <p class="text-gray-600">
                                            <i class="fas fa-phone mr-2 text-orange-500"></i>
                                            <strong>Telefone:</strong> ${aluno.telefone_responsavel}
                                        </p>
                                    ` : ''}
                                    ${aluno.local_embarque ? `
                                        <p class="text-gray-600">
                                            <i class="fas fa-map-marker-alt mr-2 text-red-500"></i>
                                            <strong>Embarque:</strong> ${aluno.local_embarque}
                                        </p>
                                    ` : ''}
                                    <p class="text-green-600 font-semibold">
                                        <i class="fas fa-dollar-sign mr-2"></i>
                                        <strong>Mensalidade:</strong> R$ ${parseFloat(aluno.valor_mensalidade || 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div class="ml-4">
                                <button onclick="excluirAluno(${aluno.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm shadow">
                                    <i class="fas fa-trash mr-1"></i>Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                `
            })
            listaDiv.innerHTML = html
        } else {
            listaDiv.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-user-graduate text-4xl mb-4 text-gray-300"></i>
                    <p class="text-lg">Nenhum aluno cadastrado ainda.</p>
                    <p class="text-sm">Cadastre o primeiro aluno usando o formulário ao lado.</p>
                </div>
            `
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
        console.error('List error:', error)
    }
}

async function excluirAluno(id) {
    if (!confirm('❌ Tem certeza que deseja excluir este aluno?')) {
        return
    }
    
    try {
        const { error } = await supabase
            .from('alunos')
            .update({ status: 'inativo' })
            .eq('id', id)
        
        if (error) {
            alert('❌ Erro ao excluir: ' + error.message)
            console.error('Delete error:', error)
        } else {
            alert('✅ Aluno excluído com sucesso!')
            listarAlunos()
            loadDashboard()
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
        console.error('Delete error:', error)
    }
}

async function buscarAlunos() {
    const termo = getElementValue('buscar-aluno')
    
    if (!termo) {
        listarAlunos()
        return
    }
    
    console.log('Buscando por:', termo)
    
    try {
        const { data, error } = await supabase
            .from('alunos')
            .select('*')
            .eq('status', 'ativo')
            .or(`nome.ilike.%${termo}%,escola.ilike.%${termo}%,nome_responsavel.ilike.%${termo}%`)
        
        if (error) {
            console.error('Search error:', error)
            listarAlunos()
            return
        }
        
        const listaDiv = document.getElementById('lista-alunos')
        if (!listaDiv) return
        
        if (data && data.length > 0) {
            let html = ''
            data.forEach(aluno => {
                html += `
                    <div class="border rounded-lg p-4 mb-3 bg-yellow-50 border-yellow-300 shadow-sm">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="font-bold text-lg text-gray-800 mb-2">
                                    <i class="fas fa-user-graduate mr-2 text-blue-500"></i>
                                    ${aluno.nome}
                                    <span class="ml-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">ENCONTRADO</span>
                                </h4>
                                <div class="space-y-1 text-sm">
                                    <p class="text-gray-600">
                                        <i class="fas fa-school mr-2 text-green-500"></i>
                                        <strong>Escola:</strong> ${aluno.escola}
                                    </p>
                                    ${aluno.nome_responsavel ? `
                                        <p class="text-gray-600">
                                            <i class="fas fa-user-friends mr-2 text-purple-500"></i>
                                            <strong>Responsável:</strong> ${aluno.nome_responsavel}
                                        </p>
                                    ` : ''}
                                    ${aluno.telefone_responsavel ? `
                                        <p class="text-gray-600">
                                            <i class="fas fa-phone mr-2 text-orange-500"></i>
                                            <strong>Telefone:</strong> ${aluno.telefone_responsavel}
                                        </p>
                                    ` : ''}
                                    <p class="text-green-600 font-semibold">
                                        <i class="fas fa-dollar-sign mr-2"></i>
                                        <strong>Mensalidade:</strong> R$ ${parseFloat(aluno.valor_mensalidade || 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div class="ml-4">
                                <button onclick="excluirAluno(${aluno.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm shadow">
                                    <i class="fas fa-trash mr-1"></i>Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                `
            })
            listaDiv.innerHTML = html
        } else {
            listaDiv.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-search text-4xl mb-4 text-gray-300"></i>
                    <p class="text-lg">Nenhum aluno encontrado para: "${termo}"</p>
                </div>
            `
        }
    } catch (error) {
        console.error('Search error:', error)
        listarAlunos()
    }
}

// ===============================
// FUNCIONALIDADES EM DESENVOLVIMENTO
// ===============================
function inicializarPresenca() {
    const hoje = new Date().toISOString().split('T')[0]
    const dataInput = document.getElementById('data-presenca')
    if (dataInput) dataInput.value = hoje
    
    const listaPresenca = document.getElementById('lista-presenca')
    if (listaPresenca) {
        listaPresenca.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-clipboard-check text-4xl mb-4 text-gray-300"></i>
                <p class="text-lg">Lista de Presença</p>
                <p class="text-sm">Selecione uma data e turno, depois clique em "Carregar"</p>
            </div>
        `
    }
}

function carregarListaPresenca() {
    alert('🔧 Lista de presença em desenvolvimento!')
}

function salvarPresenca() {
    alert('🔧 Salvar presença em desenvolvimento!')
}

async function listarMotoristas() {
    const listaDiv = document.getElementById('lista-motoristas')
    if (listaDiv) {
        listaDiv.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-user-tie text-4xl mb-4 text-gray-300"></i>
                <p class="text-lg">Gestão de Motoristas</p>
                <p class="text-sm">Funcionalidade em desenvolvimento</p>
            </div>
        `
    }
}

async function cadastrarMotorista() {
    alert('🔧 Cadastro de motoristas em desenvolvimento!')
}

async function listarMensalidades() {
    const listaDiv = document.getElementById('lista-mensalidades')
    if (listaDiv) {
        listaDiv.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-dollar-sign text-4xl mb-4 text-gray-300"></i>
                <p class="text-lg">Gestão Financeira</p>
                <p class="text-sm">Funcionalidade em desenvolvimento</p>
            </div>
        `
    }
}

async function gerarMensalidades() {
    alert('🔧 Gerar mensalidades em desenvolvimento!')
}

async function listarOcorrencias() {
    const listaDiv = document.getElementById('lista-ocorrencias')
    if (listaDiv) {
        listaDiv.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-4 text-gray-300"></i>
                <p class="text-lg">Gestão de Ocorrências</p>
                <p class="text-sm">Funcionalidade em desenvolvimento</p>
            </div>
        `
    }
}

async function registrarOcorrencia() {
    alert('🔧 Registrar ocorrência em desenvolvimento!')
}

// ===============================
// INICIALIZAÇÃO SEGURA
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema iniciado!')
    
    // Verificar elementos essenciais
    const elementos = {
        'email': document.getElementById('email'),
        'password': document.getElementById('password'),
        'login-section': document.getElementById('login-section'),
        'dashboard': document.getElementById('dashboard')
    }
    
    Object.entries(elementos).forEach(([nome, elemento]) => {
        console.log(`${nome}:`, elemento ? '✅ OK' : '❌ MISSING')
    })
    
    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            console.log('Usuário já logado:', session.user.email)
            currentUser = session.user
            setElementText('user-email', session.user.email)
            
            const loginSection = document.getElementById('login-section')
            const dashboard = document.getElementById('dashboard') 
            const userInfo = document.getElementById('user-info')
            
            if (loginSection) loginSection.classList.add('hidden')
            if (dashboard) dashboard.classList.remove('hidden')
            if (userInfo) userInfo.classList.remove('hidden')
            
            showSection('home')
        }
    }).catch(error => {
        console.error('Session check error:', error)
    })
})
