/**
 * valoracion controller
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

type ValoracionDoc = { documentId: string; Estrellas: number };

export default factories.createCoreController('api::valoracion.valoracion', ({ strapi }) => ({

  /** POST /api/valoraciones/enviar — upsert por pasaporte + participacion */
  async enviar(ctx: Context) {
    const body = (ctx.request.body as { data?: Record<string, unknown> })?.data ?? {};
    const ID_Pasaporte = String(body.ID_Pasaporte ?? '');
    const Estrellas = Number(body.Estrellas ?? 0);
    const participacion_local = String(body.participacion_local ?? '');

    if (!ID_Pasaporte || !Estrellas || !participacion_local) {
      return ctx.badRequest('Faltan campos requeridos: ID_Pasaporte, Estrellas, participacion_local');
    }
    if (Estrellas < 1 || Estrellas > 5) {
      return ctx.badRequest('Las estrellas deben estar entre 1 y 5');
    }

    const existing = await strapi.documents('api::valoracion.valoracion').findFirst({
      filters: {
        Id_pasaporte: { $eq: ID_Pasaporte },
        participacion_local: { documentId: { $eq: participacion_local } },
      },
      status: 'published',
    }) as ValoracionDoc | null;

    if (existing) {
      await strapi.documents('api::valoracion.valoracion').update({
        documentId: existing.documentId,
        data: { Estrellas },
      });
      return ctx.send({ message: 'Valoración actualizada', meta: { updated: true } });
    }

    await strapi.documents('api::valoracion.valoracion').create({
      data: {
        Id_pasaporte: ID_Pasaporte,
        Estrellas,
        participacion_local,
        publishedAt: new Date().toISOString(),
      },
    });
    return ctx.send({ message: 'Valoración enviada', meta: { updated: false } });
  },

  /** GET /api/valoraciones/de-tapa/:participacionLocalId — media y total */
  async deTapa(ctx: Context) {
    const { participacionLocalId } = ctx.params as { participacionLocalId: string };
    const results = await strapi.documents('api::valoracion.valoracion').findMany({
      filters: { participacion_local: { documentId: { $eq: participacionLocalId } } },
      fields: ['Estrellas'],
      status: 'published',
    }) as ValoracionDoc[];
    const count = results.length;
    const media = count > 0
      ? Math.round(results.reduce((s, v) => s + (v.Estrellas ?? 0), 0) / count * 10) / 10
      : null;
    return ctx.send({ data: { media, count } });
  },

  /** GET /api/valoraciones/mi-valoracion?pasaporteId=&participacionLocalId= */
  async miValoracion(ctx: Context) {
    const { pasaporteId, participacionLocalId } = ctx.query as Record<string, string>;
    if (!pasaporteId || !participacionLocalId) return ctx.send({ data: null });
    const existing = await strapi.documents('api::valoracion.valoracion').findFirst({
      filters: {
        Id_pasaporte: { $eq: pasaporteId },
        participacion_local: { documentId: { $eq: participacionLocalId } },
      },
      fields: ['Estrellas'],
      status: 'published',
    }) as ValoracionDoc | null;
    return ctx.send({ data: existing ? { Estrellas: existing.Estrellas } : null });
  },

}));
