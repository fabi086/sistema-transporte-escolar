// Configuração do Supabase
const supabaseUrl = 'https://qtvjrkgjmpbypmjhhkyg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dmpya2dqbXBieXBtamhoa3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzY0NDAsImV4cCI6MjA3NDI1MjQ0MH0.N7TJueloFMgrM-wsSi0h0nZlD1qy0QDR6pIQsJii2kI'

// Inicializar Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)
let currentUser = null

// ===============================
// SISTEMA DE AUTENTICAÇÃO
// ===============================

async function login() {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    
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
            document.getElementById('login-section').classList.add('hidden')
            document.getElementById('dashboard').classList.remove('hidden')
            document.getElementById('user-info').classList.remove('hidden')
            
            // Carregar dashboard inicial
            loadDashboard()
            showSection('home')
            
            alert('✅ Login realizado com sucesso!')
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

async function logout() {
    await supabase.auth.signOut()
    currentUser = null
    document.getElementById('login-section').classList.remove('hidden')
    document.getElementById('dashboard').classList.add('hidden')
    document.getElementById('user-info').classList.add('hidden')
    
    // Limpar campos
    document.getElementById('email').value = ''
    document.getElementById('password').value = ''
}

// ===============================
// NAVEGAÇÃO ENTRE SEÇÕES
// ===============================

function showSection(section) {
    // Esconder todas as seções
    const sections = document.querySelectorAll('.section')
    sections.forEach(s => s.classList.add('hidden'))
    
    const dashboardHome = document.getElementById('dashboard-home')
    
    if (section === 'home') {
        dashboardHome.classList.remove('hidden')
        loadDashboard()
    } else {
        dashboardHome.classList.add('hidden')
        const targetSection = document.getElementById(`section-${section}`)
        if (targetSection) {
            targetSection.classList.remove('hidden')
            
            // Carregar dados específicos da seção
            switch(section) {
                case 'alunos':
                    listarAlunos()
                    break
                case 'motoristas':
                    listarMotoristas()
                    break
                case 'financeiro':
                    listarMensalidades()
                    break
            }
        }
    }
}

// ===============================
// DASHBOARD PRINCIPAL
// ===============================

async function loadDashboard() {
    try {
        // Total de alunos
        const { data: alunos, error: errorAlunos } = await supabase
            .from('alunos')
            .select('*', { count: 'exact' })
        
        if (!errorAlunos) {
            document.getElementById('total-alunos-dash').textContent = alunos?.length || 0
        }
        
        // Total de motoristas
        const { data: motoristas, error: errorMotoristas } = await supabase
            .from('motoristas')
            .select('*', { count: 'exact' })
            .eq('status', 'ativo')
        
        if (!errorMotoristas) {
            document.getElementById('total-motoristas-dash').textContent = motoristas?.length || 0
        }
        
        // Total de rotas
        const { data: rotas, error: errorRotas } = await supabase
            .from('rotas')
            .select('*', { count: 'exact' })
            .eq('status', 'ativa')
        
        if (!errorRotas) {
            document.getElementById('total-rotas-dash').textContent = rotas?.length || 0
        }
        
        // Receita mensal
        const mesAtual = new Date().toISOString().slice(0, 7)
        const { data: mensalidades, error: errorMensalidades } = await supabase
            .from('mensalidades')
            .select('valor')
            .eq('mes_referencia', mesAtual)
            .eq('status', 'pago')
        
        if (!errorMensalidades) {
            const receita = mensalidades?.reduce((total, m) => total + parseFloat(m.valor || 0), 0) || 0
            document.getElementById('receita-mensal-dash').textContent = `R$ ${receita.toFixed(2)}`
        }
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error)
    }
}

// ===============================
// GESTÃO DE ALUNOS
// ===============================

async function cadastrarAluno() {
    const nome = document.getElementById('nome-aluno').value
    const endereco = document.getElementById('endereco-aluno').value
    const escola = document.getElementById('escola-aluno').value
    const telefone = document.getElementById('telefone-responsavel').value
    const valor = document.getElementById('valor-mensalidade').value || 150.00
    
    if (!nome || !endereco || !escola) {
        alert('❌ Preencha todos os campos obrigatórios!')
        return
    }
    
    try {
        const { data, error } = await supabase
            .from('alunos')
            .insert([{
                nome: nome,
                endereco: endereco,
                escola: escola,
                telefone_responsavel: telefone,
                valor_mensalidade: parseFloat(valor),
                status: 'ativo'
            }])
        
        if (error) {
            alert('❌ Erro ao cadastrar: ' + error.message)
        } else {
            alert('✅ Aluno cadastrado com sucesso!')
            // Limpar campos
            document.getElementById('nome-aluno').value = ''
            document.getElementById('endereco-aluno').value = ''
            document.getElementById('escola-aluno').value = ''
            document.getElementById('telefone-responsavel').value = ''
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
        
        if (data && data.length > 0) {
            let html = ''
            data.forEach(aluno => {
                html += `
                    <div class="border-b pb-3 mb-3 bg-gray-50 p-3 rounded">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="font-bold text-lg">👦 ${aluno.nome}</h4>
                                <p class="text-gray-600"><i class="fas fa-school mr-1"></i>${aluno.escola}</p>
                                <p class="text-gray-500"><i class="fas fa-map-marker-alt mr-1"></i>${aluno.endereco}</p>
                                ${aluno.telefone_responsavel ? `<p class="text-gray-500"><i class="fas fa-phone mr-1"></i>${aluno.telefone_responsavel}</p>` : ''}
                                <p class="text-green-600 font-bold"><i class="fas fa-dollar-sign mr-1"></i>R$ ${parseFloat(aluno.valor_mensalidade || 0).toFixed(2)}</p>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="editarAluno(${aluno.id})" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="excluirAluno(${aluno.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `
            })
            listaDiv.innerHTML = html
        } else {
            listaDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhum aluno cadastrado ainda.</p>'
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

async function buscarAlunos() {
    const termo = document.getElementById('buscar-aluno').value.toLowerCase()
    
    if (!termo) {
        listarAlunos()
        return
    }
    
    try {
        const { data, error } = await supabase
            .from('alunos')
            .select('*')
            .eq('status', 'ativo')
            .or(`nome.ilike.%${termo}%,escola.ilike.%${termo}%,endereco.ilike.%${termo}%`)
        
        if (error) {
            console.error('Erro na busca:', error)
            return
        }
        
        const listaDiv = document.getElementById('lista-alunos')
        
        if (data && data.length > 0) {
            let html = ''
            data.forEach(aluno => {
                html += `
                    <div class="border-b pb-3 mb-3 bg-yellow-50 p-3 rounded">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="font-bold text-lg">👦 ${aluno.nome}</h4>
                                <p class="text-gray-600"><i class="fas fa-school mr-1"></i>${aluno.escola}</p>
                                <p class="text-gray-500"><i class="fas fa-map-marker-alt mr-1"></i>${aluno.endereco}</p>
                                ${aluno.telefone_responsavel ? `<p class="text-gray-500"><i class="fas fa-phone mr-1"></i>${aluno.telefone_responsavel}</p>` : ''}
                                <p class="text-green-600 font-bold"><i class="fas fa-dollar-sign mr-1"></i>R$ ${parseFloat(aluno.valor_mensalidade || 0).toFixed(2)}</p>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="editarAluno(${aluno.id})" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="excluirAluno(${aluno.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `
            })
            listaDiv.innerHTML = html
        } else {
            listaDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhum aluno encontrado para esta busca.</p>'
        }
    } catch (error) {
        alert('❌ Erro na busca: ' + error.message)
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
        } else {
            alert('✅ Aluno excluído com sucesso!')
            listarAlunos()
            loadDashboard()
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

function editarAluno(id) {
    alert('🔧 Funcionalidade de edição em desenvolvimento!')
    // TODO: Implementar modal de edição
}

// ===============================
// GESTÃO DE MOTORISTAS
// ===============================

async function cadastrarMotorista() {
    const nome = document.getElementById('nome-motorista').value
    const telefone = document.getElementById('telefone-motorista').value
    const cnh = document.getElementById('cnh-motorista').value
    const vencimento = document.getElementById('vencimento-cnh').value
    const endereco = document.getElementById('endereco-motorista').value
    
    if (!nome || !telefone || !cnh) {
        alert('❌ Preencha todos os campos obrigatórios!')
        return
    }
    
    try {
        const { data, error } = await supabase
            .from('motoristas')
            .insert([{
                nome: nome,
                telefone: telefone,
                cnh: cnh,
                vencimento_cnh: vencimento || null,
                endereco: endereco,
                status: 'ativo'
            }])
        
        if (error) {
            alert('❌ Erro ao cadastrar: ' + error.message)
        } else {
            alert('✅ Motorista cadastrado com sucesso!')
            // Limpar campos
            document.getElementById('nome-motorista').value = ''
            document.getElementById('telefone-motorista').value = ''
            document.getElementById('cnh-motorista').value = ''
            document.getElementById('vencimento-cnh').value = ''
            document.getElementById('endereco-motorista').value = ''
            
            listarMotoristas()
            loadDashboard()
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

async function listarMotoristas() {
    try {
        const { data, error } = await supabase
            .from('motoristas')
            .select('*')
            .eq('status', 'ativo')
            .order('nome', { ascending: true })
        
        if (error) {
            alert('❌ Erro ao buscar motoristas: ' + error.message)
            return
        }
        
        const listaDiv = document.getElementById('lista-motoristas')
        
        if (data && data.length > 0) {
            let html = ''
            data.forEach(motorista => {
                const vencimento = motorista.vencimento_cnh ? new Date(motorista.vencimento_cnh).toLocaleDateString('pt-BR') : 'Não informado'
                const hoje = new Date()
                const dataVencimento = new Date(motorista.vencimento_cnh)
                const diasRestantes = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24))
                
                let statusCnh = ''
                if (motorista.vencimento_cnh) {
                    if (diasRestantes <= 0) {
                        statusCnh = '<span class="text-red-600 font-bold">⚠️ CNH Vencida</span>'
                    } else if (diasRestantes <= 30) {
                        statusCnh = `<span class="text-yellow-600 font-bold">⚠️ Vence em ${diasRestantes} dias</span>`
                    } else {
                        statusCnh = `<span class="text-green-600">✅ CNH OK</span>`
                    }
                }
                
                html += `
                    <div class="border-b pb-3 mb-3 bg-gray-50 p-3 rounded">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="font-bold text-lg">👨‍💼 ${motorista.nome}</h4>
                                <p class="text-gray-600"><i class="fas fa-phone mr-1"></i>${motorista.telefone}</p>
                                <p class="text-gray-500"><i class="fas fa-id-card mr-1"></i>CNH: ${motorista.cnh}</p>
                                <p class="text-gray-500"><i class="fas fa-calendar mr-1"></i>Vencimento: ${vencimento}</p>
                                ${statusCnh}
                                ${motorista.endereco ? `<p class="text-gray-500"><i class="fas fa-map-marker-alt mr-1"></i>${motorista.endereco}</p>` : ''}
                            </div>
                            <div class="flex gap-2">
                                <button onclick="editarMotorista(${motorista.id})" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="excluirMotorista(${motorista.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `
            })
            listaDiv.innerHTML = html
        } else {
            listaDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhum motorista cadastrado ainda.</p>'
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

async function excluirMotorista(id) {
    if (!confirm('❌ Tem certeza que deseja excluir este motorista?')) {
        return
    }
    
    try {
        const { error } = await supabase
            .from('motoristas')
            .update({ status: 'inativo' })
            .eq('id', id)
        
        if (error) {
            alert('❌ Erro ao excluir: ' + error.message)
        } else {
            alert('✅ Motorista excluído com sucesso!')
            listarMotoristas()
            loadDashboard()
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

function editarMotorista(id) {
    alert('🔧 Funcionalidade de edição em desenvolvimento!')
    // TODO: Implementar modal de edição
}

// ===============================
// GESTÃO FINANCEIRA
// ===============================

async function gerarMensalidades() {
    const mesReferencia = document.getElementById('mes-referencia').value
    
    if (!mesReferencia) {
        alert('❌ Selecione um mês de referência!')
        return
    }
    
    if (!confirm(`📋 Gerar mensalidades para ${mesReferencia}?`)) {
        return
    }
    
    try {
        // Buscar todos os alunos ativos
        const { data: alunos, error: errorAlunos } = await supabase
            .from('alunos')
            .select('*')
            .eq('status', 'ativo')
        
        if (errorAlunos) {
            alert('❌ Erro ao buscar alunos: ' + errorAlunos.message)
            return
        }
        
        if (!alunos.length) {
            alert('⚠️ Nenhum aluno ativo encontrado!')
            return
        }
        
        // Verificar se já existem mensalidades para este mês
        const { data: existentes, error: errorExistentes } = await supabase
            .from('mensalidades')
            .select('*')
            .eq('mes_referencia', mesReferencia)
        
        if (existentes && existentes.length > 0) {
            if (!confirm(`⚠️ Já existem ${existentes.length} mensalidades para ${mesReferencia}. Continuar mesmo assim?`)) {
                return
            }
        }
        
        // Gerar mensalidades
        const mensalidades = alunos.map(aluno => ({
            aluno_id: aluno.id,
            mes_referencia: mesReferencia,
            valor: aluno.valor_mensalidade || 150.00,
            status: 'pendente',
            data_vencimento: `${mesReferencia}-10` // Dia 10 de cada mês
        }))
        
        const { data, error } = await supabase
            .from('mensalidades')
            .insert(mensalidades)
        
        if (error) {
            alert('❌ Erro ao gerar mensalidades: ' + error.message)
        } else {
            alert(`✅ ${mensalidades.length} mensalidades geradas com sucesso!`)
            listarMensalidades()
            loadDashboard()
        }
        
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

async function listarMensalidades() {
    try {
        const { data, error } = await supabase
            .from('mensalidades')
            .select(`
                *,
                alunos (nome, escola)
            `)
            .order('mes_referencia', { ascending: false })
            .order('data_vencimento', { ascending: true })
        
        if (error) {
            alert('❌ Erro ao buscar mensalidades: ' + error.message)
            return
        }
        
        const listaDiv = document.getElementById('lista-mensalidades')
        
        if (data && data.length > 0) {
            let html = ''
            data.forEach(mensalidade => {
                const vencimento = new Date(mensalidade.data_vencimento).toLocaleDateString('pt-BR')
                const pagamento = mensalidade.data_pagamento ? new Date(mensalidade.data_pagamento).toLocaleDateString('pt-BR') : null
                
                let statusClass = ''
                let statusText = ''
                switch(mensalidade.status) {
                    case 'pago':
                        statusClass = 'text-green-600'
                        statusText = '✅ Pago'
                        break
                    case 'pendente':
                        statusClass = 'text-yellow-600'
                        statusText = '⏳ Pendente'
                        break
                    case 'vencido':
                        statusClass = 'text-red-600'
                        statusText = '❌ Vencido'
                        break
                }
                
                html += `
                    <div class="border-b pb-3 mb-3 bg-gray-50 p-3 rounded">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="font-bold">👦 ${mensalidade.alunos?.nome || 'Aluno não encontrado'}</h4>
                                <p class="text-gray-600">${mensalidade.alunos?.escola || ''}</p>
                                <p class="text-gray-500"><i class="fas fa-calendar mr-1"></i>Mês: ${mensalidade.mes_referencia}</p>
                                <p class="text-gray-500"><i class="fas fa-clock mr-1"></i>Vencimento: ${vencimento}</p>
                                ${pagamento ? `<p class="text-green-600"><i class="fas fa-check mr-1"></i>Pago em: ${pagamento}</p>` : ''}
                                <p class="font-bold"><i class="fas fa-dollar-sign mr-1"></i>R$ ${parseFloat(mensalidade.valor).toFixed(2)}</p>
                                <p class="${statusClass} font-bold">${statusText}</p>
                            </div>
                            <div class="flex gap-2">
                                ${mensalidade.status !== 'pago' ? `
                                    <button onclick="marcarPago(${mensalidade.id})" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                                        <i class="fas fa-check mr-1"></i>Marcar Pago
                                    </button>
                                ` : ''}
                                <button onclick="excluirMensalidade(${mensalidade.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `
            })
            listaDiv.innerHTML = html
        } else {
            listaDiv.innerHTML = '<p class="text-gray-500 text-center py-4">Nenhuma mensalidade gerada ainda.</p>'
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

async function marcarPago(id) {
    try {
        const { error } = await supabase
            .from('mensalidades')
            .update({ 
                status: 'pago',
                data_pagamento: new Date().toISOString().split('T')[0]
            })
            .eq('id', id)
        
        if (error) {
            alert('❌ Erro ao marcar como pago: ' + error.message)
        } else {
            alert('✅ Mensalidade marcada como paga!')
            listarMensalidades()
            loadDashboard()
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

async function excluirMensalidade(id) {
    if (!confirm('❌ Tem certeza que deseja excluir esta mensalidade?')) {
        return
    }
    
    try {
        const { error } = await supabase
            .from('mensalidades')
            .delete()
            .eq('id', id)
        
        if (error) {
            alert('❌ Erro ao excluir: ' + error.message)
        } else {
            alert('✅ Mensalidade excluída com sucesso!')
            listarMensalidades()
            loadDashboard()
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message)
    }
}

// ===============================
// RELATÓRIOS
// ===============================

function relatorioAlunos() {
    alert('📊 Relatório de Alunos em desenvolvimento!')
    // TODO: Implementar geração de PDF
}

function relatorioFinanceiro() {
    alert('💰 Relatório Financeiro em desenvolvimento!')
    // TODO: Implementar relatório Excel
}

function relatorioInadimplentes() {
    alert('⚠️ Relatório de Inadimplentes em desenvolvimento!')
    // TODO: Implementar relatório de pendências
}

// ===============================
// INICIALIZAÇÃO
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚌 Sistema Transporte Escolar - Versão Completa carregado!')
    
    // Verificar se há usuário logado
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            currentUser = session.user
            document.getElementById('user-email').textContent = session.user.email
            document.getElementById('login-section').classList.add('hidden')
            document.getElementById('dashboard').classList.remove('hidden')
            document.getElementById('user-info').classList.remove('hidden')
            loadDashboard()
            showSection('home')
        }
    })
    
    // Listener para mudanças de autenticação
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            currentUser = null
            document.getElementById('login-section').classList.remove('hidden')
            document.getElementById('dashboard').classList.add('hidden')
            document.getElementById('user-info').classList.add('hidden')
        }
    })
})
