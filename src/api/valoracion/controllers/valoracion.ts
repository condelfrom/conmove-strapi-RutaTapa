/**
 * valoracion controller
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

export default factories.createCoreController('api::valoracion.valoracion', ({ strapi }) => ({

  /** POST /api/valoraciones/enviar — upsert por pasaporte + participacion */
  async enviar(ctx: Context) {
    const body = ctx.request.body as { data?: { ID_Pasaporte?: string; Estrellas?: number; participacion_local?: string } };
    const { ID_Pasaporte, Estrellas, participacion_local } = body?.data ?? {};

    if (!ID_Pasaporte || !Estrellas || !participacion_local) {
      return ctx.badRequest('Faltan campos requeridos: ID_Pasaporte, Estrellas, participacion_local');
    }
    if (Estrellas < 1 || Estrellas > 5) {
      return ctx.badRequest('Las estrellas deben estar entre 1 y 5');
    }

    const existing = await strapi.db.query('api::valoracion.valoracion').findOne({
      where: { Id_pasaporte: ID_Pasaporte, participacion_local: { documentId: participacion_local } },
    });

    if (existing) {
      await strapi.db.query('api::valoracion.valoracion').update({
        where: { id: existing.id },
        data: { Estrellas },
      });
      return ctx.send({ message: 'Valoraci\u00f3n actualizada', meta: { updated: true } });
    }

    await strapi.db.query('api::valoracion.valoracion').create({
      data: { Id_pasaporte: ID_Pasaporte, Estrellas, participacion_local: { documentId: participacion_local } },
    });
    return ctx.send({ message: 'Valoraci\u00f3n enviada', meta: { updated: false } });
  },

  /** GET /api/valoraciones/de-tapa/:participacionLocalId — media y total */
  async deTapa(ctx: Context) {
    const { participacionLocalId } = ctx.params as { participacionLocalId: string };
    const results = await strapi.db.query('api::valoracion.valoracion').findMany({
      where: { participacion_local: { documentId: participacionLocalId } },
      select: ['Estrellas'],
    });
    const count = results.length;
    const media = count > 0
      ? Math.round(results.reduce((s, v) => s + ((v as { Estrellas: number }).Estrellas ?? 0), 0) / count * 10) / 10
      : null;
    return ctx.send({ data: { media, count } });
  },

  /** GET /api/valoraciones/mi-valoracion?pasaporteId=&participacionLocalId= */
  async miValoracion(ctx: Context) {
    const { pasaporteId, participacionLocalId } = ctx.query as Record<string, string>;
    if (!pasaporteId || !participacionLocalId) return ctx.send({ data: null });
    const existing = await strapi.db.query('api::valoracion.valoracion').findOne({
      where: { Id_pasaporte: pasaporteId, participacion_local: { documentId: participacionLocalId } },
      select: ['Estrellas'],
    });
    return ctx.send({ data: existing ? { Estrellas: (existing as { Estrellas: number }).Estrellas } : null });
  },

}));
