import type { Core } from '@strapi/strapi';

const PAGE_SIZE = 20;

const UIDS = [
  'api::voto.voto',
  'api::participacion-usuario.participacion-usuario',
] as const;

async function setAdminPageSize(strapi: Core.Strapi) {
  const store = strapi.store({ type: 'plugin', name: 'content-manager' });

  for (const uid of UIDS) {
    const key = `configuration_content-types::${uid}`;
    const current = (await store.get({ key })) as Record<string, unknown> | null;

    const updatedSettings = {
      ...(((current as any)?.settings) ?? {}),
      pageSize: PAGE_SIZE,
    };

    await store.set({
      key,
      value: {
        ...(current ?? { uid }),
        settings: updatedSettings,
      },
    });
  }
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await setAdminPageSize(strapi);
  },
};
