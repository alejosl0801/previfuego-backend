from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                 TableStyle, Image, PageBreak, HRFlowable)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

ROJO = colors.HexColor('#C0392B')
NEGRO = colors.HexColor('#1C1C1A')

def hacer_certificado(output_path, datos, foto_paths=[]):
    doc = SimpleDocTemplate(output_path, pagesize=A4,
        leftMargin=1.5*cm, rightMargin=1.5*cm,
        topMargin=1.5*cm, bottomMargin=2*cm)
    W = A4[0] - 3*cm

    s_body = ParagraphStyle('body', fontName='Helvetica', fontSize=9.5,
        textColor=NEGRO, alignment=TA_JUSTIFY, spaceAfter=6, leading=14)
    s_body_bold = ParagraphStyle('bb', fontName='Helvetica-Bold', fontSize=9.5,
        textColor=NEGRO, alignment=TA_LEFT, spaceAfter=4, leading=14)
    s_bullet = ParagraphStyle('bul', fontName='Helvetica', fontSize=9.5,
        textColor=NEGRO, leftIndent=20, spaceAfter=2, leading=13, bulletIndent=10)
    s_garantia = ParagraphStyle('gar', fontName='Helvetica', fontSize=9.5,
        textColor=NEGRO, alignment=TA_JUSTIFY, spaceAfter=8, leading=14)
    s_titulo_cert = ParagraphStyle('tc', fontName='Helvetica-Bold', fontSize=15,
        textColor=NEGRO, alignment=TA_CENTER, spaceAfter=6, leading=20)
    s_info = ParagraphStyle('info', fontName='Helvetica', fontSize=8.5,
        textColor=NEGRO, alignment=TA_CENTER, spaceAfter=1, leading=11)
    s_ruc = ParagraphStyle('ruc', fontName='Helvetica-Bold', fontSize=9,
        textColor=NEGRO, alignment=TA_CENTER, spaceAfter=2, leading=11)

    story = []

    # ===== HEADER =====
    logo_cell = Image('logo_sin_fondo.png', width=3.4*cm, height=3.2*cm)

    header_text = [
        Paragraph(
            '<font size="22" color="#C0392B"><b>PREVIFUEGO</b></font>',
            ParagraphStyle('pf', fontName='Helvetica-Bold', fontSize=22,
                textColor=ROJO, alignment=TA_CENTER, leading=26, spaceAfter=1)),
        Paragraph(
            '<font size="10"><b>SEGURIDAD INDUSTRIAL Y CONTRA INCENDIOS</b></font>',
            ParagraphStyle('si', fontName='Helvetica-Bold', fontSize=10,
                textColor=NEGRO, alignment=TA_CENTER, leading=13, spaceAfter=1)),
        Paragraph('RUC.: 0952773976001', s_ruc),
        Paragraph('ASESORAMIENTO - RECARGA - MANTENIMIENTOS - VENTAS', s_info),
        Paragraph('PQS (ABC) GAS CARBONICO – HALOTRON', s_info),
        Paragraph('ESTUDIO, DISEÑO E INSTALACION DE RED HIDRAULICA CONTRA INCENDIOS', s_info),
        Paragraph('SISTEMAS DE CO2 PARA COCINAS, GENERADORES, TRANSFORMADORES, ETC', s_info),
        Paragraph('INSTALACION DE LAMPARAS DE EMERGENCIA, DETECTORES DE HUMO, ETC.', s_info),
    ]

    header_table = Table([[logo_cell, header_text]], colWidths=[3.8*cm, W-3.8*cm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (0,0), 'CENTER'),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width=W, thickness=1.2, color=NEGRO, spaceAfter=8, spaceBefore=4))

    # ===== TÍTULO CERTIFICADO =====
    story.append(Spacer(1, 3))
    story.append(Paragraph(
        '<u>CERTIFICADO DE INSPECCIÓN Y MANTENIMIENTO DE EXTINTORES PORTÁTILES</u>',
        s_titulo_cert))
    story.append(Spacer(1, 6))

    # ===== CUERPO =====
    story.append(Paragraph(
        'MEDIANTE EL PRESENTE, SE GARANTIZA EL TRABAJO REALIZADO BAJO EL SIGUIENTE DETALLE:',
        s_body))

    codigo   = datos.get("local_codigo","")
    empresa  = datos.get("empresa","")
    direccion = datos.get("direccion","")
    texto_local = (
        f'``INSPECCION Y MANTENIMIENTO DE EXTINTORES PORTATILES UBICADOS EN LOS DISTINTOS PUNTOS '
        f'ESTRATEGICOS DEL LOCAL <b>{codigo}</b> PERTENECIENTE A LA EMPRESA '
        f'<b>{empresa}</b> EL CUAL ESTÁ UBICADO EN <b>{direccion}</b> '
        f'SIGUIENDO LAS NORMAS NFPA10 Y NORMATIVAS DE CALIDAD ISSO9001``'
    )
    story.append(Paragraph(texto_local, s_body))
    story.append(Spacer(1, 4))

    story.append(Paragraph('<b>COMPRENDE:</b>', s_body_bold))
    for item in [
        'REVISION INTEGRAL DE LOS CILINDROS',
        'INSPECCION DE CABEZALES',
        'INSPECCION DE CORNETAS/MANGUERAS',
        'PESAJE/TARA',
        'MANTENIMIENTO PREVENTIVO – CORRECTIVO',
        'RECARGA DEL AGENTE',
    ]:
        story.append(Paragraph(f'<bullet>\u25C6</bullet> {item}', s_bullet))
    story.append(Spacer(1, 8))

    # ===== TABLA EXTINTORES =====
    s_th  = ParagraphStyle('th', fontName='Helvetica-Bold', fontSize=9.5,
        alignment=TA_CENTER, textColor=NEGRO)
    s_th2 = ParagraphStyle('th2', fontName='Helvetica-Bold', fontSize=9.5,
        alignment=TA_CENTER, textColor=NEGRO, leading=13)
    s_td  = ParagraphStyle('td', fontName='Helvetica-Bold', fontSize=10,
        alignment=TA_CENTER, textColor=NEGRO)
    s_td_r = ParagraphStyle('tdr', fontName='Helvetica-Bold', fontSize=10,
        alignment=TA_CENTER, textColor=ROJO)

    table_data = [[
        Paragraph('<b><u>CANT.</u></b>', s_th),
        Paragraph('<b><u>CAPACIDAD</u></b>', s_th),
        Paragraph('<b><u>TIPO</u></b>', s_th),
        Paragraph('<b><u>ÚLTIMO\nMANTENIMIENTO</u></b>', s_th2),
        Paragraph('<b><u>PROXIMO\nMANTENIMIENTO</u></b>', s_th2),
    ]]

    for ext in datos['extintores']:
        table_data.append([
            Paragraph(f'<b>{ext["cant"]}</b>', s_td),
            Paragraph(f'<b>{ext["capacidad"]}</b>', s_td),
            Paragraph(f'<b>{ext["tipo"]}</b>', s_td),
            Paragraph(f'<b>{datos["mes_año"]}</b>', s_td_r),
            Paragraph(f'<b>{datos["mes_año_proximo"]}</b>', s_td_r),
        ])

    for _ in range(max(0, 5 - len(datos['extintores']))):
        table_data.append(['','','','',''])

    ext_table = Table(table_data,
        colWidths=[W*0.12, W*0.20, W*0.18, W*0.25, W*0.25])
    ext_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.8, NEGRO),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(ext_table)
    story.append(Spacer(1, 10))

    # ===== GARANTÍA =====
    story.append(Paragraph(
        'Los extintores detallados se encuentran operativos en base a la norma NFPA10 y normativa '
        'ecuatoriana vigente, así mismo, cada extintor cuenta con sus respectivos precintos y seguros metálicos, '
        'etiqueta de control de carga, accesorios en buen estado y agente extintor en óptimas condiciones que '
        'garantiza su funcionamiento con vigencia de (1)año a partir de su último mantenimiento.',
        s_garantia))

    # ===== FOOTER =====
    story.append(HRFlowable(width=W, thickness=2, color=ROJO, spaceBefore=4, spaceAfter=6))
    footer_p = Paragraph(
        '<b>DIR: PORTETE #3007 Y GALLEGOS LARA &nbsp;&nbsp;&nbsp; '
        'TEL: 04-2374822 – 0978997247 - 09835883325 &nbsp;&nbsp;&nbsp; '
        'EMAIL: ventas_previfuego@hotmail.com</b>',
        ParagraphStyle('ft', fontName='Helvetica-Bold', fontSize=8.5,
            textColor=NEGRO, alignment=TA_CENTER, leading=12))
    story.append(footer_p)

    # ===== PÁGINA 2: FOTOS =====
    story.append(PageBreak())

    fotos_validas = [f for f in foto_paths if f]
    if fotos_validas:
        story.append(Spacer(1, 1*cm))
        n = min(3, len(fotos_validas))
        ancho_foto = (W - (n-1)*0.5*cm) / n
        alto_foto = ancho_foto * 0.75
        cells = []
        for fp in fotos_validas[:3]:
            try:
                cells.append(Image(fp, width=ancho_foto-3*mm, height=alto_foto))
            except:
                cells.append('')
        while len(cells) < 3:
            cells.append('')
        foto_table = Table([cells], colWidths=[ancho_foto]*3)
        foto_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('LEFTPADDING', (0,0), (-1,-1), 2),
            ('RIGHTPADDING', (0,0), (-1,-1), 2),
        ]))
        story.append(foto_table)
    else:
        story.append(Spacer(1, 3*cm))
        story.append(Paragraph('[Fotos del trabajo]',
            ParagraphStyle('ph', fontName='Helvetica', fontSize=11,
                textColor=colors.gray, alignment=TA_CENTER)))

    story.append(Spacer(1, 1*cm))
    story.append(HRFlowable(width=W, thickness=2, color=ROJO, spaceBefore=8, spaceAfter=6))
    story.append(footer_p)

    doc.build(story)
    print(f"✓ {output_path}")

