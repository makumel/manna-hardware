import os
import re
import pdfplumber
import glob
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def clean_num(s):
    if not s:
        return None
    s = s.replace(',', '').replace('P', '').replace('$', '').strip()
    try:
        val = float(s)
        if val.is_integer():
            return int(val)
        return val
    except:
        return None

def build_excel():
    # Find all PDFs and sort numerically by quote number
    files = glob.glob('*.pdf')
    def get_num(fn):
        m = re.search(r'\d+', fn)
        return int(m.group()) if m else 9999
    files = sorted(files, key=get_num)
    
    col_bounds = [36.0, 85.6, 139.6, 207.0, 423.0, 490.6, 576.0]
    col_names = ['Qty', 'U/M', 'Capital', 'Item', 'Price', 'Total']
    
    wb = Workbook()
    # Remove default sheet
    wb.remove(wb.active)
    
    # Styles
    font_company = Font(name="Calibri", size=13, bold=True, color="1F497D")
    font_quote_title = Font(name="Calibri", size=14, bold=True, color="1F497D")
    font_meta_hdr = Font(name="Calibri", size=9, bold=True, color="FFFFFF")
    fill_meta_hdr = PatternFill(start_color="1F497D", end_color="1F497D", fill_type="solid")
    font_meta_val = Font(name="Calibri", size=10, bold=False)
    
    font_tbl_hdr = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
    fill_tbl_hdr = PatternFill(start_color="2F5597", end_color="2F5597", fill_type="solid")
    fill_tbl_calc = PatternFill(start_color="333f48", end_color="333f48", fill_type="solid") # dark slate for added calc columns
    
    font_data = Font(name="Calibri", size=10)
    font_total = Font(name="Calibri", size=11, bold=True)
    
    thin_border_side = Side(style='thin', color='D9D9D9')
    box_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
    
    total_double_bottom = Border(top=Side(style='thin', color='000000'), bottom=Side(style='double', color='000000'))
    
    align_center = Alignment(horizontal='center', vertical='center')
    align_left = Alignment(horizontal='left', vertical='center')
    align_right = Alignment(horizontal='right', vertical='center')
    
    summary_data = []

    for f in files:
        with pdfplumber.open(f) as pdf:
            # Metadata from first page
            tables = pdf.pages[0].extract_tables()
            t0 = tables[0] if len(tables) > 0 else []
            t1 = tables[1] if len(tables) > 1 else []
            
            rep = t0[1][0] if len(t0) > 1 and len(t0[1]) > 0 else 'AIZA'
            proj = t0[1][1] if len(t0) > 1 and len(t0[1]) > 1 else ''
            date_str = t0[1][2] if len(t0) > 1 and len(t0[1]) > 2 else ''
            quote_num_str = t0[1][3] if len(t0) > 1 and len(t0[1]) > 3 else ''
            addr = t1[1][0] if len(t1) > 1 and len(t1[1]) > 0 else 'FANVILL CABALAWAN.'
            
            # Sheet name: e.g. "Quote 01" or "Quote 02"
            num_int = get_num(f)
            sheet_title = f"Quote {num_int:02d}"
            ws = wb.create_sheet(title=sheet_title)
            ws.views.sheetView[0].showGridLines = True
            
            # Header info
            ws['A1'] = "Fanvill Hardware Cabalwan"
            ws['A1'].font = font_company
            ws['A2'] = "CABAL-AWAN TACLOBAN"
            ws['A2'].font = Font(name="Calibri", size=10, italic=True)
            
            ws['G1'] = "PRICE QUOTE"
            ws['G1'].font = font_quote_title
            ws['G1'].alignment = Alignment(horizontal='right')
            
            # Meta box
            # Row 4: Labels
            ws['A4'] = "Name / Address"
            ws['A4'].font = font_meta_hdr
            ws['A4'].fill = fill_meta_hdr
            ws.merge_cells('A4:C4')
            
            ws['D4'] = "Rep"
            ws['D4'].font = font_meta_hdr
            ws['D4'].fill = fill_meta_hdr
            ws['D4'].alignment = align_center
            
            ws['E4'] = "Project"
            ws['E4'].font = font_meta_hdr
            ws['E4'].fill = fill_meta_hdr
            ws['E4'].alignment = align_center
            
            ws['F4'] = "Date"
            ws['F4'].font = font_meta_hdr
            ws['F4'].fill = fill_meta_hdr
            ws['F4'].alignment = align_center
            
            ws['G4'] = "Quote #"
            ws['G4'].font = font_meta_hdr
            ws['G4'].fill = fill_meta_hdr
            ws['G4'].alignment = align_center
            
            # Row 5: Values
            ws['A5'] = addr
            ws['A5'].font = font_meta_val
            ws.merge_cells('A5:C5')
            
            ws['D5'] = rep
            ws['D5'].font = font_meta_val
            ws['D5'].alignment = align_center
            
            ws['E5'] = proj
            ws['E5'].font = font_meta_val
            ws['E5'].alignment = align_center
            
            ws['F5'] = date_str
            ws['F5'].font = font_meta_val
            ws['F5'].alignment = align_center
            
            ws['G5'] = quote_num_str
            ws['G5'].font = font_meta_val
            ws['G5'].alignment = align_center
            
            # Table Headers at Row 7
            headers = [
                ("Qty", align_right, fill_tbl_hdr),
                ("U/M", align_center, fill_tbl_hdr),
                ("Item", align_left, fill_tbl_hdr),
                ("Unit Capital", align_right, fill_tbl_hdr),
                ("Total Capital", align_right, fill_tbl_calc),
                ("Unit Price", align_right, fill_tbl_hdr),
                ("Total Selling Price", align_right, fill_tbl_calc)
            ]
            
            row_idx = 7
            for c_idx, (h_name, h_align, h_fill) in enumerate(headers, start=1):
                cell = ws.cell(row=row_idx, column=c_idx, value=h_name)
                cell.font = font_tbl_hdr
                cell.fill = h_fill
                cell.alignment = h_align
                
            # Extract line items across all pages of this PDF
            all_items = []
            for page in pdf.pages:
                words = page.extract_words()
                table_words = [w for w in words if 125 <= w['top'] <= 688]
                sorted_words = sorted(table_words, key=lambda w: w['top'])
                
                rows_grouped = []
                curr_row = []
                curr_y = None
                for w in sorted_words:
                    if curr_y is None or abs(w['top'] - curr_y) < 3.5:
                        curr_row.append(w)
                        curr_y = w['top'] if curr_y is None else (curr_y * len(curr_row) + w['top'])/(len(curr_row)+1)
                    else:
                        rows_grouped.append(curr_row)
                        curr_row = [w]
                        curr_y = w['top']
                if curr_row:
                    rows_grouped.append(curr_row)
                    
                for r_words in rows_grouped:
                    row_data = {c: [] for c in col_names}
                    for w in r_words:
                        cx = (w['x0'] + w['x1']) / 2.0
                        for i in range(len(col_bounds) - 1):
                            if col_bounds[i] <= cx < col_bounds[i+1]:
                                row_data[col_names[i]].append(w['text'])
                                break
                    item = " ".join(row_data['Item']).strip()
                    total_str = " ".join(row_data['Total']).strip()
                    qty_str = " ".join(row_data['Qty']).strip()
                    price_str = " ".join(row_data['Price']).strip()
                    um_str = " ".join(row_data['U/M']).strip()
                    cap_str = " ".join(row_data['Capital']).strip()
                    
                    if item or total_str or qty_str:
                        all_items.append({
                            'Qty': clean_num(qty_str),
                            'U/M': um_str,
                            'Capital': clean_num(cap_str),
                            'Item': item,
                            'Price': clean_num(price_str),
                            'Total': clean_num(total_str)
                        })
            
            start_row = 8
            current_r = start_row
            for item in all_items:
                # Col A: Qty
                cell_qty = ws.cell(row=current_r, column=1, value=item['Qty'])
                cell_qty.alignment = align_right
                cell_qty.number_format = '#,##0' if isinstance(item['Qty'], int) else '#,##0.00'
                cell_qty.font = font_data
                cell_qty.border = box_border
                
                # Col B: U/M
                cell_um = ws.cell(row=current_r, column=2, value=item['U/M'])
                cell_um.alignment = align_center
                cell_um.font = font_data
                cell_um.border = box_border
                
                # Col C: Item
                cell_item = ws.cell(row=current_r, column=3, value=item['Item'])
                cell_item.alignment = align_left
                cell_item.font = font_data
                cell_item.border = box_border
                
                # Col D: Unit Capital (User can fill this in, formatted as number/currency)
                cell_cap = ws.cell(row=current_r, column=4, value=item['Capital'])
                cell_cap.alignment = align_right
                cell_cap.number_format = '#,##0.00'
                cell_cap.font = font_data
                cell_cap.border = box_border
                
                # Col E: Total Capital = Qty * Unit Capital: IF(ISNUMBER(D{r}), A{r}*D{r}, "")
                cell_tot_cap = ws.cell(row=current_r, column=5)
                cell_tot_cap.value = f'=IF(ISNUMBER(D{current_r}), A{current_r}*D{current_r}, "")'
                cell_tot_cap.alignment = align_right
                cell_tot_cap.number_format = '#,##0.00'
                cell_tot_cap.font = font_data
                cell_tot_cap.border = box_border
                
                # Col F: Unit Price
                cell_price = ws.cell(row=current_r, column=6, value=item['Price'])
                cell_price.alignment = align_right
                cell_price.number_format = '#,##0.00'
                cell_price.font = font_data
                cell_price.border = box_border
                
                # Col G: Total Selling Price: formula =A{r}*F{r} (or original if not matching)
                cell_tot_sell = ws.cell(row=current_r, column=7)
                cell_tot_sell.value = f'=A{current_r}*F{current_r}'
                cell_tot_sell.alignment = align_right
                cell_tot_sell.number_format = '#,##0.00'
                cell_tot_sell.font = font_data
                cell_tot_sell.border = box_border
                
                current_r += 1
                
            end_row = current_r - 1
            
            # Total Row
            tot_row = current_r
            ws.cell(row=tot_row, column=3, value="Total").font = font_total
            ws.cell(row=tot_row, column=3).alignment = Alignment(horizontal='right', vertical='center')
            
            # Total Capital Sum
            tot_cap_cell = ws.cell(row=tot_row, column=5)
            tot_cap_cell.value = f'=SUM(E{start_row}:E{end_row})'
            tot_cap_cell.font = font_total
            tot_cap_cell.alignment = align_right
            tot_cap_cell.number_format = '#,##0.00'
            tot_cap_cell.border = total_double_bottom
            
            # Total Selling Price Sum
            tot_sell_cell = ws.cell(row=tot_row, column=7)
            tot_sell_cell.value = f'=SUM(G{start_row}:G{end_row})'
            tot_sell_cell.font = font_total
            tot_sell_cell.alignment = align_right
            tot_sell_cell.number_format = '#,##0.00'
            tot_sell_cell.border = total_double_bottom
            
            # Column widths
            ws.column_dimensions['A'].width = 12
            ws.column_dimensions['B'].width = 10
            ws.column_dimensions['C'].width = 44
            ws.column_dimensions['D'].width = 15
            ws.column_dimensions['E'].width = 16
            ws.column_dimensions['F'].width = 15
            ws.column_dimensions['G'].width = 20
            
            summary_data.append({
                'sheet': sheet_title,
                'quote': quote_num_str,
                'date': date_str,
                'rep': rep,
                'items_count': len(all_items),
                'tot_cap_ref': f"'{sheet_title}'!E{tot_row}",
                'tot_sell_ref': f"'{sheet_title}'!G{tot_row}"
            })
            
    # Add a master Summary sheet at the beginning
    summary_ws = wb.create_sheet(title="Summary", index=0)
    summary_ws.views.sheetView[0].showGridLines = True
    
    summary_ws['A1'] = "PRICE QUOTES MASTER SUMMARY"
    summary_ws['A1'].font = font_company
    summary_ws['A2'] = "Fanvill Hardware Cabalwan | Tacloban"
    summary_ws['A2'].font = Font(name="Calibri", size=10, italic=True)
    
    sum_headers = [
        ("Quote #", align_center),
        ("Date", align_center),
        ("Rep", align_center),
        ("Items Count", align_right),
        ("Total Capital", align_right),
        ("Total Selling Price", align_right),
        ("Sheet Link", align_left)
    ]
    
    s_row = 4
    for c_idx, (h_name, h_align) in enumerate(sum_headers, start=1):
        c = summary_ws.cell(row=s_row, column=c_idx, value=h_name)
        c.font = font_tbl_hdr
        c.fill = fill_tbl_hdr
        c.alignment = h_align
        
    cur_s_row = 5
    for s in summary_data:
        c1 = summary_ws.cell(row=cur_s_row, column=1, value=s['quote'])
        c1.alignment = align_center
        c1.font = font_data
        
        c2 = summary_ws.cell(row=cur_s_row, column=2, value=s['date'])
        c2.alignment = align_center
        c2.font = font_data
        
        c3 = summary_ws.cell(row=cur_s_row, column=3, value=s['rep'])
        c3.alignment = align_center
        c3.font = font_data
        
        c4 = summary_ws.cell(row=cur_s_row, column=4, value=s['items_count'])
        c4.alignment = align_right
        c4.font = font_data
        c4.number_format = '#,##0'
        
        c5 = summary_ws.cell(row=cur_s_row, column=5, value=f"={s['tot_cap_ref']}")
        c5.alignment = align_right
        c5.font = font_data
        c5.number_format = '#,##0.00'
        
        c6 = summary_ws.cell(row=cur_s_row, column=6, value=f"={s['tot_sell_ref']}")
        c6.alignment = align_right
        c6.font = font_data
        c6.number_format = '#,##0.00'
        
        c7 = summary_ws.cell(row=cur_s_row, column=7, value=s['sheet'])
        c7.hyperlink = f"#'{s['sheet']}'!A1"
        c7.font = Font(name="Calibri", size=10, color="0000FF", underline="single")
        c7.alignment = align_left
        
        cur_s_row += 1
        
    # Grand Total row in Summary
    summary_ws.cell(row=cur_s_row, column=3, value="Grand Total").font = font_total
    summary_ws.cell(row=cur_s_row, column=3).alignment = align_right
    
    c_tot_cap = summary_ws.cell(row=cur_s_row, column=5, value=f"=SUM(E5:E{cur_s_row-1})")
    c_tot_cap.font = font_total
    c_tot_cap.alignment = align_right
    c_tot_cap.number_format = '#,##0.00'
    c_tot_cap.border = total_double_bottom
    
    c_tot_sell = summary_ws.cell(row=cur_s_row, column=6, value=f"=SUM(F5:F{cur_s_row-1})")
    c_tot_sell.font = font_total
    c_tot_sell.alignment = align_right
    c_tot_sell.number_format = '#,##0.00'
    c_tot_sell.border = total_double_bottom
    
    summary_ws.column_dimensions['A'].width = 12
    summary_ws.column_dimensions['B'].width = 14
    summary_ws.column_dimensions['C'].width = 12
    summary_ws.column_dimensions['D'].width = 14
    summary_ws.column_dimensions['E'].width = 18
    summary_ws.column_dimensions['F'].width = 22
    summary_ws.column_dimensions['G'].width = 16
    
    out_file = "Fanvill_Hardware_Price_Quotes.xlsx"
    wb.save(out_file)
    print(f"Successfully generated {out_file} with {len(summary_data)} quote sheets + Summary sheet!")

if __name__ == '__main__':
    build_excel()
