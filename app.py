import os
import io
import base64
import smtplib
import tempfile
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from flask import Flask, request, jsonify
from flask_cors import CORS

from cert_generator import hacer_certificado

app = Flask(__name__)
CORS(app)

# ===== CONFIGURACIÓN =====
EMAIL_USER = os.environ.get('EMAIL_USER', 'ventas_previfuego@hotmail.com')
EMAIL_PASS = os.environ.get('EMAIL_PASS', '')
CC_FIJOS = [
    'sandra.guanuna@kfc.com.ec',
    'velia.sanchez@kfc.com.ec',
    'ventas_previfuego@hotmail.com',
]

# ===== PATRONES DE CORREO POR MARCA =====
def correo_local(codigo):
    if not codigo:
        return None
    codigo = codigo.upper().replace('-','').replace(' ','')
    marca = codigo[0]
    num = ''.join(filter(str.isdigit, codigo))
    patrones = {
        'K': f'kfck{num}@kfc.com.ec',
        'M': f'm{num}@menestrasdelnegro.com.ec',
        'I': f'ilci{num}@ilci.com.ec',
        'J': f'cjnc{num}@cajun.com.ec',
        'T': f'trot{num}@tropiburger.com.ec',
        'A': f'amca{num}@americandeli.com.ec',
        'V': f'jv{num}@juanvaldezcafe.com.ec',
        'B': f'br{num}@baskin-cinnabon.com.ec',
        'G': f'gusg{num}@gus.com.ec',
        'R': f'r{num}@casares.com.ec',
    }
    return patrones.get(marca)

# ===== ENDPOINT: GENERAR Y ENVIAR CERTIFICADO =====
@app.route('/certificado', methods=['POST'])
def generar_certificado():
    try:
        body = request.json

        # Datos del local
        codigo        = body.get('codigo', '')
        local_codigo  = body.get('local_codigo', '')
        empresa       = body.get('empresa', '')
        direccion     = body.get('direccion', '')
        extintores    = body.get('extintores', [])
        fotos_b64     = body.get('fotos', [])  # lista de base64
        accesorios    = body.get('accesorios', [])

        # Fechas automáticas
        now = datetime.now()
        mes_año          = f'{now.month:02d}/{now.year}'
        mes_año_proximo  = f'{now.month:02d}/{now.year + 1}'

        datos = {
            'local_codigo':   local_codigo,
            'empresa':        empresa,
            'direccion':      direccion,
            'mes_año':        mes_año,
            'mes_año_proximo': mes_año_proximo,
            'extintores':     extintores,
        }

        # Guardar fotos temporalmente
        foto_paths = []
        tmp_files = []
        for b64 in fotos_b64:
            if not b64:
                continue
            # Puede venir como "data:image/jpeg;base64,XXXX" o solo "XXXX"
            if ',' in b64:
                b64 = b64.split(',')[1]
            img_bytes = base64.b64decode(b64)
            tmp = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
            tmp.write(img_bytes)
            tmp.close()
            foto_paths.append(tmp.name)
            tmp_files.append(tmp.name)

        # Generar PDF
        codigo_limpio = codigo.replace('-','').replace(' ','')
        nombre_pdf = f'{codigo}-MANTT DE EXTINTORES - {now.year}.pdf'
        pdf_path = f'/tmp/{nombre_pdf}'
        hacer_certificado(pdf_path, datos, foto_paths)

        # Leer PDF generado
        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()

        # Limpiar temporales
        for t in tmp_files:
            try: os.unlink(t)
            except: pass

        # Enviar correo si hay credenciales
        correo_destino = correo_local(codigo)
        enviado = False
        if EMAIL_PASS and correo_destino:
            enviado = enviar_correo(
                para=correo_destino,
                cc=CC_FIJOS,
                nombre_pdf=nombre_pdf,
                pdf_bytes=pdf_bytes,
                local_nombre=empresa,
                mes_año=mes_año,
            )

        # Devolver PDF en base64 + estado
        pdf_b64 = base64.b64encode(pdf_bytes).decode()
        return jsonify({
            'ok': True,
            'pdf_b64': pdf_b64,
            'nombre_pdf': nombre_pdf,
            'correo_destino': correo_destino,
            'enviado': enviado,
        })

    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500


# ===== ENVÍO DE CORREO =====
def enviar_correo(para, cc, nombre_pdf, pdf_bytes, local_nombre, mes_año):
    try:
        msg = MIMEMultipart()
        msg['From']    = EMAIL_USER
        msg['To']      = para
        msg['CC']      = ', '.join(cc)
        msg['Subject'] = f'CERTIFICADO MANTT EXTINTORES {mes_año.replace("/", " ")}'

        cuerpo = (
            'Estimados, reciban un cordial saludo.\n\n'
            'Adjunto al presente encontrarán el certificado correspondiente '
            'al mantenimiento de extintores 2026.\n\n'
            'Quedamos atentos a cualquier requerimiento adicional.\n\n'
            'Bendiciones,\nPrevifuego'
        )
        msg.attach(MIMEText(cuerpo, 'plain'))

        adjunto = MIMEApplication(pdf_bytes, _subtype='pdf')
        adjunto.add_header('Content-Disposition', 'attachment', filename=nombre_pdf)
        msg.attach(adjunto)

        # Hotmail / Outlook usa SMTP con TLS
        with smtplib.SMTP('smtp-mail.outlook.com', 587) as server:
            server.ehlo()
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            todos = [para] + cc
            server.sendmail(EMAIL_USER, todos, msg.as_string())

        return True
    except Exception as e:
        print(f'Error correo: {e}')
        return False


# ===== HEALTH CHECK =====
@app.route('/', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'app': 'Previfuego Backend v1.0'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
