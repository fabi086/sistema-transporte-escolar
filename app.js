// Melhorar a função showSection
function showSection(section) {
    console.log('Mostrando seção:', section)
    
    // Remover active de todos os botões
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active')
    })
    
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(s => {
        s.classList.add('hidden')
        s.classList.remove('active')
    })
    
    const dashboardHome = document.getElementById('dashboard-home')
    
    if (section === 'home') {
        if (dashboardHome) {
            dashboardHome.style.display = 'grid'
        }
        loadDashboard()
        
        const homeBtn = document.querySelector('button[onclick="showSection(\'home\')"]')
        if (homeBtn) homeBtn.classList.add('active')
    } else {
        if (dashboardHome) {
            dashboardHome.style.display = 'none'
        }
        
        const targetSection = document.getElementById(`section-${section}`)
        console.log('Procurando seção:', `section-${section}`, targetSection)
        
        if (targetSection) {
            targetSection.classList.remove('hidden')
            targetSection.classList.add('active')
            targetSection.style.display = 'block'
            
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
            console.error(`Seção ${section} não encontrada!`)
            alert(`Seção ${section} não encontrada!`)
        }
    }
}
