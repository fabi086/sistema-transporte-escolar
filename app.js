// Configuração do Supabase
const supabaseUrl = 'https://qtvjrkgjmpbypmjhhkyg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dmpya2dqbXBieXBtamhoa3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzY0NDAsImV4cCI6MjA3NDI1MjQ0MH0.N7TJueloFMgrM-wsSi0h0nZlD1qy0QDR6pIQsJii2kI'

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)
let currentUser = null

console.log('🚌 Sistema carregado!')

// ===============================
// LOGIN/LOGOUT
// ===============================
async function login() {
    const email = document.getElementById('email').value.trim()
    const password = document.getElementById('password').value.trim()
    
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
        } else {
            currentUser = data.user
            document.getElementById('user-email').textContent = data.user.email
            document.getElementById('login-section').style.display = 'none'
            document.getElementById('dashboard').style.display = 'block'
            document.getElementById('user-info').style.display = 'flex'
            
            alert('✅ Login realizado com sucesso!')
            mostrarSecao('home')
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

async function logout() {
    await supabase.auth.signOut()
    currentUser = null
    document.getElementById('login-section').style.display = 'block'
    document.getElementById('dashboard').style.display = 'none'
    document.getElementById('user-info').style.display = 'none'
    document.getElementById('email').value = ''
    document.getElementById('password').value = ''
}

// ===============================
// NAVEGAÇÃO SIMPLES
// ===============================
function mostrarSecao(secao) {
    console.log('Mostrando seção:', secao)
    
    // Esconder todas as seções
    const secoes = ['home', 'alunos', 'presenca', 'motoristas']
    secoes.forEach(s => {
        const elemento = document.getElementById(`secao-${s}`)
        if (elemento) {
            elemento.style.display = 'none'
        }
    })
    
    // Remover active dos botões
    const botoes = ['btn-home', 'btn-alunos', 'btn-presenca', 'btn-motoristas']
    botoes.forEach(b => {
        const btn = document.getElementById(b)
        if (btn) {
            btn.classList.remove('bg-gray-800')
            btn.classList.add('bg-gray-600')
        }
    })
    
    // Mostrar seção selecionada
    const secaoAtiva = document.getElementById(`secao-${secao}`)
    const botaoAtivo = document.getElementById(`btn-${secao}`)
    
    if (secaoAtiva) {
        secaoAtiva.style.display = 'block'
        console.log('✅ Seção mostrada:', secao)
    } else {
        console.error('❌ Seção não encontrada:', secao)
    }
    
    if (botaoAtivo) {
        botaoAtivo.classList.remove('bg-gray-600')
        botaoAtivo.classList.add('bg-gray-800')
    }
    
    // Carregar dados específicos
    switch(secao) {
        case 'home':
            loadDashboard()
            break
        case 'alunos':
            listarAlunos()
            break
        case 'presenca':
            inicializarPresenca()
            break
        case 'motoristas':
            listarMotoristas()
            break
    }
}

// ===============================
// DASHBOARD
// ===============================
async function loadDashboard() {
    try {
        const { data: alunos, error } = await supabase
            .from('alunos')
            .select('*')
            .eq('status', 'ativo')
        
        if (!error && alunos) {
            document.getElementById('total-alunos-dash').textContent = alunos.length
        }
        
        document.getElementById('presentes-hoje-dash').textContent = '0'
        document.getElementById('total-motoristas-dash').textContent = '0'
        document.getElementById('receita-mensal-dash').textContent = 'R$ 0'
        
    } catch (error) {
        console.error('Erro dashboard:', error)
    }
}

// ===============================
// GESTÃO DE ALUNOS
// ===============================
async function cadastrarAluno() {
    const nome = document.getElementById('nome-aluno').value.trim()
    const escola = document.getElementById('escola-aluno').value.trim()
    const responsavel = document.getElementById('nome-responsavel').value.trim()
    const telefone = document.getElementById('telefone-responsavel').value.trim()
    const embarque = document.getElementById('local-embarque').value.trim()
    const endereco = document.getElementById('endereco-aluno').value.trim()
    const valor = document.getElementById('valor-mensalidade').value.trim()
    
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
        const { error } = await supabase
            .from('alunos')
            .insert([dados])
        
        if (error) {
            alert('❌ Erro ao cadastrar: ' + error.message)
        } else {
            alert('✅ Aluno cadastrado com sucesso!')
            
            // Limpar campos
            document.getElementById('nome-aluno').value = ''
            document.getElementById('escola-aluno').value = ''
            document.getElementById('nome-responsavel').value = ''
            document.getElementById('telefone-responsavel').value = ''
            document.getElementById('local-embarque').value = ''
            document.getElementById('endereco-aluno').value = ''
            document.getElementById('valor-mensalidade').value = ''
            
            listarAlunos()
            loadDashboard()
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

async function listarAlunos() {
    try {
        const { data, error } = await supabase
            .from('alunos')
            .select('*')
            .eq('status', 'ativo')
            .order('nome', { ascending: true })
        
        if (error) {
            alert('❌ Erro ao buscar alunos: ' + error.message)
            return
        }
        
        const listaDiv = document.getElementById('lista-alunos')
        if (!listaDiv) return
        
        if (data && data.length > 0) {
            let html = ''
            data.forEach(aluno => {
                html += `
                    <div class="border rounded-lg p-4 mb-3 bg-blue-50 shadow hover:shadow-md">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="font-bold text-lg text-gray-800 mb-2">
                                    <i class="fas fa-user-graduate mr-2 text-blue-500"></i>
                                    ${aluno.nome}
                                </h4>
                                <div class="space-y-1 text-sm">
                                    <p class="text-gray-600">
                                        <i class="fas fa-school mr-2 text-green-500"></i>
                                        ${aluno.escola}
                                    </p>
                                    ${aluno.nome_responsavel ? `
                                        <p class="text-gray-600">
                                            <i class="fas fa-user-friends mr-2 text-purple-500"></i>
                                            ${aluno.nome_responsavel}
                                        </p>
                                    ` : ''}
                                    ${aluno.telefone_responsavel ? `
                                        <p class="text-gray-600">
                                            <i class="fas fa-phone mr-2 text-orange-500"></i>
                                            ${aluno.telefone_responsavel}
                                        </p>
                                    ` : ''}
                                    ${aluno.local_embarque ? `
                                        <p class="text-gray-600">
                                            <i class="fas fa-map-marker-alt mr-2 text-red-500"></i>
                                            ${aluno.local_embarque}
                                        </p>
                                    ` : ''}
                                    <p class="text-green-600 font-semibold">
                                        <i class="fas fa-dollar-sign mr-2"></i>
                                        R$ ${parseFloat(aluno.valor_mensalidade || 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <button onclick="excluirAluno(${aluno.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm ml-4">
                                <i class="fas fa-trash mr-1"></i>Excluir
                            </button>
                        </div>
                    </div>
                `
            })
            listaDiv.innerHTML = html
        } else {
            listaDiv.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-user-graduate text-4xl mb-4"></i>
                    <p>Nenhum aluno cadastrado ainda.</p>
                </div>
            `
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

async function excluirAluno(id) {
    if (!confirm('❌ Excluir este aluno?')) return
    
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

async function buscarAlunos() {
    const termo = document.getElementById('buscar-aluno').value.toLowerCase().trim()
    
    if (!termo) {
        listarAlunos()
        return
    }
    
    try {
        const { data, error } = await supabase
            .from('alunos')
            .select('*')
            .eq('status', 'ativo')
            .or(`nome.ilike.%${termo}%,escola.ilike.%${termo}%,nome_responsavel.ilike.%${termo}%`)
        
        const listaDiv = document.getElementById('lista-alunos')
        if (!listaDiv) return
        
        if (data && data.length > 0) {
            let html = ''
            data.forEach(aluno => {
                html += `
                    <div class="border rounded-lg p-4 mb-3 bg-yellow-50 border-yellow-300">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="font-bold text-lg mb-2">
                                    <i class="fas fa-user-graduate mr-2 text-blue-500"></i>
                                    ${aluno.nome}
                                    <span class="bg-yellow-500 text-white text-xs px-2 py-1 rounded ml-2">ENCONTRADO</span>
                                </h4>
                                <p class="text-gray-600"><i class="fas fa-school mr-2"></i>${aluno.escola}</p>
                                ${aluno.nome_responsavel ? `<p class="text-gray-600"><i class="fas fa-user-friends mr-2"></i>${aluno.nome_responsavel}</p>` : ''}
                            </div>
                            <button onclick="excluirAluno(${aluno.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm ml-4">
                                <i class="fas fa-trash mr-1"></i>Excluir
                            </button>
                        </div>
                    </div>
                `
            })
            listaDiv.innerHTML = html
        } else {
            listaDiv.innerHTML = `<div class="text-center py-8 text-gray-500"><i class="fas fa-search text-4xl mb-4"></i><p>Nenhum aluno encontrado para: "${termo}"</p></div>`
        }
    } catch (error) {
        listarAlunos()
    }
}

// ===============================
// OUTRAS FUNÇÕES
// ===============================
function inicializarPresenca() {
    const hoje = new Date().toISOString().split('T')[0]
    const dataInput = document.getElementById('data-presenca')
    if (dataInput) dataInput.value = hoje
}

function carregarListaPresenca() {
    alert('🔧 Lista de presença em desenvolvimento!')
}

async function listarMotoristas() {
    const listaDiv = document.getElementById('lista-motoristas')
    if (listaDiv) {
        listaDiv.innerHTML = '<p class="text-center py-4 text-gray-500">Funcionalidade em desenvolvimento</p>'
    }
}

async function cadastrarMotorista() {
    alert('🔧 Cadastro de motoristas em desenvolvimento!')
}

// ===============================
// INICIALIZAÇÃO
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema iniciado!')
    
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            currentUser = session.user
            document.getElementById('user-email').textContent = session.user.email
            document.getElementById('login-section').style.display = 'none'
            document.getElementById('dashboard').style.display = 'block'
            document.getElementById('user-info').style.display = 'flex'
            mostrarSecao('home')
        }
    })
})
