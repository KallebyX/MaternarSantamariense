import React from 'react'
import { motion } from 'framer-motion'
import { 
  FileText,
  Video,
  Link2,
  ExternalLink,
  BookOpen,
  Layers,
  GraduationCap,
  Heart
} from 'lucide-react'

interface Product {
  id: string
  title: string
  type: 'PDF' | 'Video' | 'Website' | 'App' | 'Tool'
  url: string
  description?: string
  author?: string
  year?: string
}

const ProdutosPPGSMI: React.FC = () => {
  const products: Product[] = [
    {
      id: '1',
      title: 'ToolNurse',
      type: 'Tool',
      url: 'https://toolnurse.ufn.edu.br/',
      description: 'Ferramenta para enfermagem'
    },
    {
      id: '2',
      title: 'Álbum Seriado Pré-natal',
      type: 'PDF',
      url: 'https://pergamum.ufn.edu.br/pergamumweb/vinculos/0000c5/0000c57a.pdf',
      description: 'Material educativo ilustrado para gestantes'
    },
    {
      id: '3',
      title: 'Fluxograma Pré-natal',
      type: 'PDF',
      url: 'https://pergamum.ufn.edu.br/pergamumweb/vinculos/0000c5/0000c5fe.pdf',
      author: 'Cátia',
      description: 'Fluxograma para atendimento pré-natal'
    },
    {
      id: '4',
      title: 'Documentário | Pré-natal e nascimento: a maternidade na voz de profissionais e usuárias',
      type: 'Video',
      url: 'https://www.youtube.com/watch?v=PzqnC0paEA8',
      description: 'Documentário sobre experiências no pré-natal'
    },
    {
      id: '5',
      title: 'Cartilha de orientações sobre o Pré-natal, parto e pós-parto',
      type: 'PDF',
      url: 'https://pergamum.ufn.edu.br/pergamumweb/vinculos/0000bf/0000bfec.pdf',
      description: 'Guia completo para gestantes e profissionais'
    },
    {
      id: '6',
      title: 'Menina mulher grávida: de novo? Documentário sobre a reincidência da gestação na adolescência',
      type: 'Video',
      url: 'https://www.youtube.com/watch?v=9_yXb3Ly5oQ&t=2s',
      description: 'Documentário sobre gravidez recorrente na adolescência'
    },
    {
      id: '7',
      title: 'CARTILHA "ORIENTAÇÕES PARA AS MULHERES NO PERÍODO PUERPERAL"',
      type: 'PDF',
      url: 'https://www.ufn.edu.br/Arquivos/vue/Portfolio/a53420f0-c96d-46e6-b42c-b62983720685.pdf',
      description: 'Orientações para o período pós-parto'
    },
    {
      id: '8',
      title: 'Coisas que você precisa saber antes do seu bebê nascer',
      type: 'Website',
      url: 'https://pediatraluisapinheiro.com.br/',
      description: 'Portal com informações essenciais para pais',
      author: 'Dra. Luísa Pinheiro'
    },
    {
      id: '9',
      title: 'Cartilha de orientações sobre o ecocardiograma fetal na gestação',
      type: 'PDF',
      url: 'https://pergamum.ufn.edu.br/pergamumweb/vinculos/0000c6/0000c608.pdf',
      description: 'Orientações sobre exame cardíaco fetal'
    },
    {
      id: '10',
      title: 'Trilhando o Puerpério: Autodescoberta e Saúde Mental',
      type: 'PDF',
      url: 'https://www.ufn.edu.br/Arquivos/vue/Portfolio/a42d5374-983f-4131-b7f0-6d209cbcac6f.pdf',
      description: 'Guia sobre saúde mental no pós-parto'
    },
    {
      id: '11',
      title: 'MEDICAMENTOS E OUTRAS SUBSTÂNCIAS DURANTE A AMAMENTAÇÃO',
      type: 'Website',
      url: 'https://amamos.lapinf.ufn.edu.br/buscar/categoria',
      description: 'Plataforma sobre medicamentos na amamentação'
    },
    {
      id: '12',
      title: 'Protocolo de Enfermagem Ao pré-natal de baixo risco',
      type: 'PDF',
      url: 'https://pergamum.ufn.edu.br/pergamumweb/vinculos/0000c4/0000c48b.pdf',
      description: 'Protocolo para atendimento de enfermagem'
    },
    {
      id: '13',
      title: 'ÁLBUM SERIADO FOTOGRÁFICO: FORMAS DE APRESENTAÇÃO DA ALIMENTAÇÃO COMPLEMENTAR PARA CRIANÇAS',
      type: 'Website',
      url: 'https://drive.google.com/drive/folders/1BDi76730bvskLibpQEWlJKk7VRIcIlKc',
      description: 'Material visual sobre alimentação infantil'
    },
    {
      id: '14',
      title: 'Aplicativo Fortalece Pré-natal',
      type: 'App',
      url: 'https://play.google.com/store/apps/details?id=io.kodular.miguelmachado0007.fortalece&pcampaignid=web_share',
      description: 'App para acompanhamento do pré-natal'
    },
    {
      id: '15',
      title: 'Site Apoiare Puerpério: Promoção da rede de apoio no puerpério',
      type: 'Website',
      url: 'https://www.apoiare.lapinf.ufn.edu.br/',
      description: 'Plataforma de apoio para o período pós-parto'
    },
    {
      id: '16',
      title: 'Aplicativo SOS Kids',
      type: 'App',
      url: 'https://play.google.com/store/apps/details?id=com.ufn.soskids&hl=pt_BR',
      description: 'App para emergências pediátricas'
    },
    {
      id: '17',
      title: 'Hora Ouro: Semente de Esperança',
      type: 'Video',
      url: 'https://youtube.com/watch?v=A9AfL3F1enc&si=1-EYa_PDyWSvZFWV',
      description: 'Vídeo sobre a primeira hora de vida'
    },
    {
      id: '18',
      title: 'O que fazer se o bebê engasgar?',
      type: 'Video',
      url: 'https://www.youtube.com/watch?v=Mr48F49Uqso',
      description: 'Instruções de primeiros socorros'
    },
    {
      id: '19',
      title: 'O banho do bebê',
      type: 'Video',
      url: 'https://www.youtube.com/watch?v=lm6wJiCXJPY&feature=youtu.be',
      description: 'Tutorial sobre higiene do recém-nascido'
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return FileText
      case 'Video':
        return Video
      case 'Website':
        return Link2
      case 'App':
      case 'Tool':
        return Layers
      default:
        return BookOpen
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'text-red-600 bg-red-50'
      case 'Video':
        return 'text-purple-600 bg-purple-50'
      case 'Website':
        return 'text-blue-600 bg-blue-50'
      case 'App':
      case 'Tool':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="text-center mb-8">
          {/* Logos */}
          <div className="flex justify-center items-center gap-8 mb-6">
            <img 
              src="/logo-ppgsmi.png" 
              alt="Logo PPGSMI" 
              className="h-20"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <img 
              src="/logo-ufn.png" 
              alt="Logo UFN" 
              className="h-20"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
            <GraduationCap className="w-8 h-8 text-purple-600" />
            Produtos Técnico-tecnológicos no PPGSMI
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Acervo completo de produtos desenvolvidos no Programa de Pós-Graduação em Saúde Materno Infantil.
            Recursos educacionais, ferramentas e materiais para profissionais de saúde.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
            <FileText className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {products.filter(p => p.type === 'PDF').length}
            </p>
            <p className="text-sm text-gray-600">Documentos PDF</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
            <Video className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {products.filter(p => p.type === 'Video').length}
            </p>
            <p className="text-sm text-gray-600">Vídeos</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
            <Link2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {products.filter(p => p.type === 'Website').length}
            </p>
            <p className="text-sm text-gray-600">Websites</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
            <Layers className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {products.filter(p => p.type === 'App' || p.type === 'Tool').length}
            </p>
            <p className="text-sm text-gray-600">Apps e Ferramentas</p>
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {products.map((product) => {
          const Icon = getTypeIcon(product.type)
          const colorClass = getTypeColor(product.type)

          return (
            <motion.a
              key={product.id}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              variants={item}
              whileHover={{ y: -5, scale: 1.02 }}
              className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.title}
                </h3>

                {product.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${colorClass}`}>
                    {product.type}
                  </span>
                  {product.author && (
                    <span className="text-xs text-gray-500">
                      {product.author}
                    </span>
                  )}
                </div>
              </div>
            </motion.a>
          )
        })}
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <Heart className="w-8 h-8 text-pink-500 mx-auto mb-3" />
          <p className="text-gray-700">
            Todos os produtos foram desenvolvidos com dedicação pelos alunos e professores do PPGSMI,
            visando a melhoria da qualidade do cuidado materno-infantil.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default ProdutosPPGSMI