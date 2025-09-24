// Configuração do Supabase - VOCÊ VAI PREENCHER DEPOIS
const supabaseUrl = https://qtvjrkgjmpbypmjhhkyg.supabase.co
const supabaseKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dmpya2dqbXBieXBtamhoa3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzY0NDAsImV4cCI6MjA3NDI1MjQ0MH0.N7TJueloFMgrM-wsSi0h0nZlD1qy0QDR6pIQsJii2kI

// Inicializar Supabase
let supabase;
if (supabaseUrl !== https://qtvjrkgjmpbypmjhhkyg.supabase.co) {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey)
    console.log('Supabase conectado!')
} else {
    console.log('Configure o Supabase primeiro!')
}

// Função de teste
function testeConexao() {
    if (supabase) {
        alert('✅ JavaScript funcionando! Supabase configurado!')
    } else {
        alert('⚠️ JavaScript funcionando! Configure o Supabase.')
    }
}

// Função de Login
async function login() {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    
    if (!email || !password) {
        alert('❌ Preencha email e senha!')
        return
    }

    if (!supabase) {
        alert('⚠️ Configure o Supabase primeiro!')
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
            document.getElementById('login-section').classList.add('hidden')
            document.getElementById('dashboard').classList.remove('hidden')
            alert('✅ Login realizado com sucesso!')
            listarAlunos()
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

// Função para Cadastrar Aluno
async function cadastrarAluno() {
    const nome = document.getElementById('nome-aluno').value
    const endereco = document.getElementById('endereco-aluno').value
    const escola = document.getElementById('escola-aluno').value
    
    if (!nome || !endereco || !escola) {
        alert('❌ Preencha todos os campos!')
        return
    }

    if (!supabase) {
        alert('⚠️ Configure o Supabase primeiro!')
        return
    }
    
    try {
        const { data, error } = await supabase
            .from('alunos')
            .insert([
                { nome: nome, endereco: endereco, escola: escola }
            ])
        
        if (error) {
            alert('❌ Erro ao cadastrar: ' + error.message)
        } else {
            alert('✅ Aluno cadastrado com sucesso!')
            // Limpar campos
            document.getElementById('nome-aluno').value = ''
            document.getElementById('endereco-aluno').value = ''
            document.getElementById('escola-aluno').value = ''
            listarAlunos()
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

// Função para Listar Alunos
async function listarAlunos() {
    if (!supabase) {
        document.getElementById('lista-alunos').innerHTML = '<p class="text-red-500">⚠️ Configure o Supabase!</p>'
        return
    }

    try {
        const { data, error } = await supabase
            .from('alunos')
            .select('*')
        
        if (error) {
            alert('❌ Erro ao buscar: ' + error.message)
            return
        }
        
        const listaDiv = document.getElementById('lista-alunos')
        const totalDiv = document.getElementById('total-alunos')
        
        if (data && data.length > 0) {
            let html = ''
            data.forEach(aluno => {
                html += `
                    <div class="border-b pb-2 mb-2">
                        <strong>👦 ${aluno.nome}</strong><br>
                        <small class="text-gray-600">🏫 ${aluno.escola}</small><br>
                        <small class="text-gray-500">📍 ${aluno.endereco}</small>
                    </div>
                `
            })
            listaDiv.innerHTML = html
            totalDiv.textContent = data.length
        } else {
            listaDiv.innerHTML = '<p class="text-gray-500">Nenhum aluno ainda.</p>'
            totalDiv.textContent = '0'
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}
