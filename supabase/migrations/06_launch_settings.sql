-- =====================================================================
-- 06_launch_settings.sql : datos finales de contacto y dominio PES
-- Ejecutar una vez en proyectos Supabase que ya aplicaron 01_schema.sql.
-- =====================================================================

update public.system_settings
   set contact_email = 'pes@panamarinesolutions.com',
       whatsapp_number = '50766794702',
       website_url = 'https://www.pes.panamarinesolutions.com',
       address = 'Industrial Terminal Zone (Zona 1), Ciudad de Panama, Panama',
       quotation_terms = 'Esta cotizacion esta sujeta a la disponibilidad confirmada por Panama Energy Solutions al momento de la aprobacion. PES presta directamente el servicio y puede contar con el apoyo operativo de companias aliadas cuando sea necesario. Los montos indicados no incluyen cargos adicionales derivados de condiciones de acceso no informadas previamente.'
 where singleton = true;
