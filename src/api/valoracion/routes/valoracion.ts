export default {
  routes: [
    // Custom routes first
    {
      method: 'POST',
      path: '/valoraciones/enviar',
      handler: 'valoracion.enviar',
      config: {
        policies: [],
        middlewares: [],
        auth: false, // public — no token required
      },
    },
    {
      method: 'GET',
      path: '/valoraciones/de-tapa/:participacionLocalId',
      handler: 'valoracion.deTapa',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/valoraciones/mi-valoracion',
      handler: 'valoracion.miValoracion',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
  ],
};
