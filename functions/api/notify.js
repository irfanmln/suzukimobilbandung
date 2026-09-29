// POST /api/notify {type:'INSERT', table, record} -> Resend + Telegram
// Port Cloudflare Pages dari api/notify.js (Vercel). Path sama sehingga
// frontend tidak perlu diubah untuk notif.
import { json } from './_lib.js';

export async function onRequestPost(context) {
  try {
    const { type, table, record } = await context.request.json();
    if (type !== 'INSERT') return json({ message: 'Not an INSERT event, skipping' });

    let subject = '';
    let htmlBody = '';
    let notifText = '';

    if (table === 'test_drive') {
      subject = '🚗 Lead Baru: Test Drive - Suzuki Mobil Bandung';
      notifText = `🚗 *Lead Baru: Test Drive*\nNama: ${record.name || record.nama || '-'}\nNo. HP: ${record.no_hp || record.phone || record.whatsapp || '-'}\nMobil: ${record.mobil || record.tipe_mobil || record.car || '-'}\nTanggal: ${record.tanggal || record.jadwal || '-'}`;
      htmlBody = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a56db;padding:20px;text-align:center;"><h1 style="color:#fff;margin:0;font-size:22px;">🚗 Permintaan Test Drive Baru</h1></div>
        <div style="padding:24px;background:#f9f9f9;"><p><b>Nama:</b> ${record.name || record.nama || '-'}<br><b>No HP:</b> ${record.no_hp || record.phone || '-'}<br><b>Mobil:</b> ${record.mobil || record.tipe_mobil || '-'}<br><b>Tanggal:</b> ${record.tanggal || record.jadwal || '-'}<br><b>Pesan:</b> ${record.pesan || record.message || '-'}</p></div></div>`;
    } else if (table === 'simulasi_kredit') {
      subject = '💰 Lead Baru: Simulasi Kredit - Suzuki Mobil Bandung';
      notifText = `💰 *Lead Baru: Simulasi Kredit*\nNama: ${record.name || record.nama || '-'}\nNo. HP: ${record.no_hp || record.phone || record.whatsapp || '-'}\nMobil: ${record.mobil || record.tipe_mobil || record.car || '-'}\nDP: ${record.dp || record.uang_muka || '-'}\nTenor: ${record.tenor ? record.tenor + ' bulan' : '-'}\nDomisili: ${record.asal_kota || record.domisili || '-'}`;
      htmlBody = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a56db;padding:20px;text-align:center;"><h1 style="color:#fff;margin:0;font-size:22px;">💰 Permintaan Simulasi Kredit Baru</h1></div>
        <div style="padding:24px;background:#f9f9f9;"><p><b>Nama:</b> ${record.name || record.nama || '-'}<br><b>No HP:</b> ${record.no_hp || '-'}<br><b>Mobil:</b> ${record.mobil || record.tipe_mobil || '-'}<br><b>DP:</b> ${record.dp || record.uang_muka || '-'}<br><b>Tenor:</b> ${record.tenor || '-'}<br><b>Domisili:</b> ${record.asal_kota || record.domisili || '-'}</p></div></div>`;
    } else {
      return json({ message: `Table '${table}' not handled, skipping` });
    }

    const RESEND_API_KEY = context.env.RESEND_API_KEY;
    const NOTIF_TO = context.env.NOTIF_TO || 'irfanm991@gmail.com';
    if (RESEND_API_KEY) {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Suzuki Mobil Bandung <noreply@suzukimobilbandung.com>',
          to: [NOTIF_TO],
          subject,
          html: htmlBody,
        }),
      });
      if (!resp.ok) {
        const d = await resp.text();
        console.error('Resend error:', d);
      }
    }

    const TG_TOKEN = context.env.TELEGRAM_BOT_TOKEN;
    const TG_CHAT = context.env.TELEGRAM_CHAT_ID;
    if (TG_TOKEN && TG_CHAT) {
      try {
        await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TG_CHAT, text: notifText, parse_mode: 'Markdown' }),
        });
      } catch (e) { console.error('Telegram error:', e.message); }
    }

    return json({ success: true });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
