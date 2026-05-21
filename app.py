import os
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

# CORS completamente abierto
CORS(app, resources={r"/*": {"origins": "*"}}, 
     supports_credentials=False,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "OPTIONS"])

EMAIL_USER = os.environ.get('EMAIL_USER', 'ventas_previfuego@hotmail.com')
EMAIL_PASS = os.environ.get('EMAIL_PASS', '')

PATRONES = {
    'K': 'kfck{n}@kfc.com.ec',
    'M': 'm{n}@menestrasdelnegro.com.ec',
    'I': 'ilci{n}@ilci.com.ec',
    'J': 'cjnc{n}@cajun.com.ec',
    'T': 'trot{n}@tropiburger.com.ec',
    'A': 'amca{n}@americandeli.com.ec',
    'V': 'jv{n}@juanvaldezcafe.com.ec',
    'B': 'br{n}@baskin-cinnabon.com.ec',
    'G': 'gusg{n}@gus.com.ec',
    'R': 'r{n}@casares.com.ec',
}

def correo_local(codigo):
    if not codigo:
        return None
    c = codigo.upper().replace('-','').replace(' ','')
    marca = c[0]
    num = ''.join(filter(str.isdigit, c))
    patron = PATRONES.get(marca)
    return patron.format(n=num) if patron else None

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@app.route('/', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'app': 'Previfuego Backend v1.0'})

@app.route('/certificado', methods=['POST', 'OPTIONS'])
def generar_certificado():
    if request.method == 'OPTIONS':
        return jsonify({'ok': True}), 200

    try:
        body = request.json
        if not body:
            return jsonify({'ok': False, 'error': 'No data received'}), 400

        codigo       = body.get('codigo', 'K-000')
        local_codigo = body.get('local_codigo', '')
        empresa      = body.get('empresa', '')
        direccion    = body.get('direccion', '')
        extintores   = body.get('extintores', [])
        fotos_b64    = body.get('fotos', [])
        accesorios   = body.get('accesorios', [])

        now = datetime.now()
        mes_año         = f'{now.month:02d}/{now.year}'
        mes_año_proximo = f'{now.month:02d}/{now.year + 1}'

        datos = {
            'local_codigo':    local_codigo,
            'empresa':         empresa,
            'direccion':       direccion,
            'mes_año':         mes_año,
            'mes_año_proximo': mes_año_proximo,
            'extintores':      extintores,
        }

        # Guardar fotos temporalmente
        foto_paths = []
        tmp_files  = []
        for b64 in fotos_b64:
            if not b64:
                continue
            try:
                data = b64.split(',')[1] if ',' in b64 else b64
                img_bytes = base64.b64decode(data)
                tmp = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
                tmp.write(img_bytes)
                tmp.close()
                foto_paths.append(tmp.name)
                tmp_files.append(tmp.name)
            except Exception as e:
                print(f'Error procesando foto: {e}')

        # Generar PDF
        nombre_pdf = f'{codigo}-MANTT DE EXTINTORES - {now.year}.pdf'
        pdf_path   = f'/tmp/{nombre_pdf}'
        hacer_certificado(pdf_path, datos, foto_paths)

        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()

        # Limpiar temporales
        for t in tmp_files:
            try: os.unlink(t)
            except: pass

        # Enviar correo SOLO a tu correo (modo prueba)
        enviado = False
        if EMAIL_PASS:
            enviado = enviar_correo(
                para=EMAIL_USER,
                cc=[],
                nombre_pdf=nombre_pdf,
                pdf_bytes=pdf_bytes,
                mes_año=mes_año,
            )

        pdf_b64 = base64.b64encode(pdf_bytes).decode()
        return jsonify({
            'ok':             True,
            'pdf_b64':        pdf_b64,
            'nombre_pdf':     nombre_pdf,
            'correo_destino': EMAIL_USER,
            'enviado':        enviado,
        })

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'ok': False, 'error': str(e)}), 500


def enviar_correo(para, cc, nombre_pdf, pdf_bytes, mes_año):
    try:
        msg = MIMEMultipart()
        msg['From']    = EMAIL_USER
        msg['To']      = para
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

        with smtplib.SMTP('smtp-mail.outlook.com', 587) as server:
            server.ehlo()
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, [para] + cc, msg.as_string())

        return True
    except Exception as e:
        print(f'Error correo: {e}')
        return False


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
