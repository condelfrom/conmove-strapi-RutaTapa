/**
 * valoracion router
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/valoraciones/enviar',
      handler: 'valoracion.enviar',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/valoraciones/de-tapa/:participacionLocalId',
      handler: 'valoracion.deTapa',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/valoraciones/mi-valoracion',
      handler: 'valoracion.miValoracion',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/valoraciones',
      handler: 'valoracion.find',
      config: { auth: false },
    },
    {
      method: 'DELETE',
      path: '/valoraciones/:id',
      handler: 'valoracion.delete',
      config: {},
    },
  ],
};
