export const ORGAOS_COMUNICADOS = ['NEPeS', 'Políticas de Saúde', 'Superintendência da APS'];

export const gestao = usuario => ['Gestor', 'Administrador'].includes(usuario?.perfil);
export const podePublicarAvisos = usuario => gestao(usuario) || usuario?.publicar_avisos === 1 || usuario?.publicar_avisos === true;
export const podeGerenciarAviso = (usuario, aviso) => gestao(usuario) || (podePublicarAvisos(usuario) && aviso.autor_id === usuario.id);
