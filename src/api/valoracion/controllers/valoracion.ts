import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::valoracion.valoracion',
  ({ strapi }) => ({
    /**
     * POST /api/valoraciones/enviar
     * Body: { data: { ID_Pasaporte, Estrellas, participacion_local (documentId) } }
     *
     * Rules:
     *  - Estrellas must be 1–5
     *  - One valoracion per (ID_Pasaporte + participacion_local)
     *  - If already exists, UPDATE (upsert)
     */
    async enviar(ctx) {
      const { ID_Pasaporte, Estrellas, participacion_local } = ctx.request.body?.data ?? {};

      // ── Validation ────────────────────────────────────────────────────────
      if (!ID_Pasaporte || typeof ID_Pasaporte !== 'string' || ID_Pasaporte.trim() === '') {
        return ctx.badRequest('ID_Pasaporte es obligatorio');
      }
      if (!Estrellas || typeof Estrellas !== 'number' || Estrellas < 1 || Estrellas > 5) {
        return ctx.badRequest('Estrellas debe ser un número entre 1 y 5');
      }
      if (!participacion_local || typeof participacion_local !== 'string') {
        return ctx.badRequest('participacion_local (documentId) es obligatorio');
      }

      // ── Resolve participacion_local documentId → numeric id ───────────────
      const participaciones = await strapi.documents('api::participacion-envento.participacion-envento').findMany({
        filters: { documentId: { $eq: participacion_local } } as never,
        limit: 1,
      });

      if (!participaciones || participaciones.length === 0) {
        return ctx.notFound('Participacion_local no encontrada');
      }

      const participacionDocumentId = participaciones[0].documentId;

      // ── Check duplicate ───────────────────────────────────────────────────
      const existing = await strapi.documents('api::valoracion.valoracion').findMany({
        filters: {
          ID_Pasaporte: { $eq: ID_Pasaporte.trim() },
          participacion_local: { documentId: { $eq: participacionDocumentId } },
        } as never,
        limit: 1,
      });

      if (existing && existing.length > 0) {
        // Upsert: update existing valoracion
        const updated = await strapi.documents('api::valoracion.valoracion').update({
          documentId: existing[0].documentId,
          data: { Estrellas },
        });
        return ctx.send({
          data: updated,
          meta: { updated: true },
          message: 'Valoración actualizada correctamente',
        });
      }

      // ── Create new valoracion ─────────────────────────────────────────────
      const created = await strapi.documents('api::valoracion.valoracion').create({
        data: {
          ID_Pasaporte: ID_Pasaporte.trim(),
          Estrellas,
          participacion_local: participacionDocumentId,
        } as never,
      });

      return ctx.send({
        data: created,
        meta: { updated: false },
        message: 'Valoración enviada correctamente',
      });
    },

    /**
     * GET /api/valoraciones/de-tapa/:participacionLocalId
     * Returns { media, count } for the given participacion_local
     */
    async deTapa(ctx) {
      const { participacionLocalId } = ctx.params;

      if (!participacionLocalId) {
        return ctx.badRequest('participacionLocalId es obligatorio');
      }

      const valoraciones = await strapi.documents('api::valoracion.valoracion').findMany({
        filters: {
          participacion_local: { documentId: { $eq: participacionLocalId } },
        } as never,
      });

      const count = valoraciones.length;
      const media =
        count > 0
          ? Math.round((valoraciones.reduce((sum, v) => sum + (v.Estrellas as number), 0) / count) * 10) / 10
          : null;

      return ctx.send({ data: { media, count } });
    },

    /**
     * GET /api/valoraciones/mi-valoracion?pasaporteId=&participacionLocalId=
     * Returns the existing star value (if any) for this passport + tapa
     */
    async miValoracion(ctx) {
      const { pasaporteId, participacionLocalId } = ctx.query as Record<string, string>;

      if (!pasaporteId || !participacionLocalId) {
        return ctx.badRequest('pasaporteId y participacionLocalId son obligatorios');
      }

      const existing = await strapi.documents('api::valoracion.valoracion').findMany({
        filters: {
          ID_Pasaporte: { $eq: pasaporteId.trim() },
          participacion_local: { documentId: { $eq: participacionLocalId } },
        } as never,
        limit: 1,
      });

      if (!existing || existing.length === 0) {
        return ctx.send({ data: null });
      }

      return ctx.send({ data: { Estrellas: existing[0].Estrellas } });
    },
  })
);
