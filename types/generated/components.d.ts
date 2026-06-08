import type { Schema, Struct } from '@strapi/strapi';

export interface CompartidoContacto extends Struct.ComponentSchema {
  collectionName: 'components_compartido_contactos';
  info: {
    displayName: 'Contacto';
    icon: 'phone';
  };
  attributes: {
    direccion: Schema.Attribute.String;
    telefono_local: Schema.Attribute.String;
  };
}

export interface CompartidoProducto extends Struct.ComponentSchema {
  collectionName: 'components_compartido_productos';
  info: {
    displayName: 'Producto';
  };
  attributes: {
    Descripcion: Schema.Attribute.Text;
    Descripcion_Va: Schema.Attribute.Text;
    Foto_Producto: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    Nombre: Schema.Attribute.String;
    Nombre_Va: Schema.Attribute.String;
    presentado: Schema.Attribute.Boolean;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'compartido.contacto': CompartidoContacto;
      'compartido.producto': CompartidoProducto;
    }
  }
}
