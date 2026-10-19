import os
import sys
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import openpyxl
from tksheet import Sheet

class ExcelStyleQuoteApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Fanvill Hardware - Price Quotes Spreadsheet")
        self.root.geometry("1280x780")
        self.root.minsize(1050, 650)
        
        # Colors
        self.primary_color = "#107C41"  # Excel Green branding
        self.header_bg = "#107C41"
        self.accent_green = "#28A745"
        self.bg_color = "#F3F3F3"
        self.root.configure(bg=self.bg_color)
        
        # Locate workbook
        exe_dir = os.path.dirname(os.path.abspath(sys.argv[0]))
        default_excel = os.path.join(exe_dir, "Fanvill_Hardware_Price_Quotes.xlsx")
        if not os.path.exists(default_excel):
            default_excel = os.path.join(os.getcwd(), "Fanvill_Hardware_Price_Quotes.xlsx")
            
        self.excel_file_path = default_excel if os.path.exists(default_excel) else ""
        self.workbook = None
        self.current_sheet_name = ""
        self.sheet_data = [] # 2D matrix
        self.row_excel_map = [] # row index in sheet -> row number in openpyxl
        
        self.setup_ui()
        
        if self.excel_file_path and os.path.exists(self.excel_file_path):
            self.load_workbook_file(self.excel_file_path)

    def setup_ui(self):
        # Top Ribbon Bar (Excel style)
        ribbon_frame = tk.Frame(self.root, bg=self.primary_color, height=60)
        ribbon_frame.pack(fill=tk.X, side=tk.TOP)
        ribbon_frame.pack_propagate(False)
        
        title_box = tk.Frame(ribbon_frame, bg=self.primary_color)
        title_box.pack(side=tk.LEFT, padx=18, pady=8)
        
        lbl_title = tk.Label(
            title_box, text="📊 FANVILL HARDWARE — SPREADSHEET EDITOR", 
            font=("Segoe UI", 13, "bold"), fg="white", bg=self.primary_color
        )
        lbl_title.pack(anchor=tk.W)
        
        lbl_sub = tk.Label(
            title_box, text="Full Excel Grid: Click any cell & start typing | Tab / Arrows / Enter to move | Copy-Paste supported",
            font=("Segoe UI", 8), fg="#D8F3DC", bg=self.primary_color
        )
        lbl_sub.pack(anchor=tk.W)
        
        # Actions on Ribbon
        btn_box = tk.Frame(ribbon_frame, bg=self.primary_color)
        btn_box.pack(side=tk.RIGHT, padx=18)
        
        btn_open = tk.Button(
            btn_box, text="📂 Open Excel", font=("Segoe UI", 9, "bold"),
            bg="#0B5A30", fg="white", activebackground="#084223", activeforeground="white",
            relief=tk.FLAT, padx=12, pady=5, cursor="hand2", command=self.browse_file
        )
        btn_open.pack(side=tk.LEFT, padx=6)
        
        btn_save = tk.Button(
            btn_box, text="💾 Save (Ctrl+S)", font=("Segoe UI", 9, "bold"),
            bg="#21A366", fg="white", activebackground="#187B4C", activeforeground="white",
            relief=tk.FLAT, padx=16, pady=5, cursor="hand2", command=self.save_workbook
        )
        btn_save.pack(side=tk.LEFT, padx=6)
        
        self.root.bind("<Control-s>", lambda e: self.save_workbook())
        self.root.bind("<Control-S>", lambda e: self.save_workbook())
        
        # Sheet Tabs Bar at Top (like Excel sheet tabs)
        self.tabs_frame = tk.Frame(self.root, bg="#E1DFDD", height=35)
        self.tabs_frame.pack(fill=tk.X, side=tk.TOP)
        self.tabs_frame.pack_propagate(False)
        
        # We'll use a horizontal canvas + scrollbar for Excel-like sheet tabs
        tabs_canvas_box = tk.Frame(self.tabs_frame, bg="#E1DFDD")
        tabs_canvas_box.pack(fill=tk.BOTH, expand=True)
        
        self.tabs_canvas = tk.Canvas(tabs_canvas_box, bg="#E1DFDD", height=32, highlightthickness=0)
        self.tabs_inner = tk.Frame(self.tabs_canvas, bg="#E1DFDD")
        self.tabs_canvas.create_window((0, 0), window=self.tabs_inner, anchor="nw")
        
        self.tabs_canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.tabs_inner.bind("<Configure>", lambda e: self.tabs_canvas.configure(scrollregion=self.tabs_canvas.bbox("all")))
        
        # Mousewheel scroll for tabs
        self.tabs_canvas.bind("<MouseWheel>", lambda e: self.tabs_canvas.xview_scroll(int(-1 * (e.delta / 120)), "units"))
        
        # Info & Formula Bar
        f_bar = tk.Frame(self.root, bg="#FFFFFF", height=30, relief=tk.SOLID, bd=1)
        f_bar.pack(fill=tk.X, padx=8, pady=(4, 0))
        f_bar.pack_propagate(False)
        
        self.lbl_cell_loc = tk.Label(f_bar, text="Ready", font=("Segoe UI", 9, "bold"), bg="#FFFFFF", fg="#107C41", width=14, anchor=tk.W, padx=6)
        self.lbl_cell_loc.pack(side=tk.LEFT)
        
        tk.Label(f_bar, text="fx |", font=("Segoe UI", 9, "italic"), bg="#FFFFFF", fg="gray").pack(side=tk.LEFT, padx=4)
        
        self.formula_val = tk.StringVar()
        f_entry = tk.Entry(f_bar, textvariable=self.formula_val, font=("Segoe UI", 9), relief=tk.FLAT, bg="#FFFFFF")
        f_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=4)
        f_entry.bind("<Return>", self.on_formula_entry_return)
        
        # Main Grid Area (tksheet Sheet)
        grid_container = tk.Frame(self.root, bg="white", relief=tk.SOLID, bd=1)
        grid_container.pack(fill=tk.BOTH, expand=True, padx=8, pady=4)
        
        self.grid = Sheet(
            grid_container,
            show_x_scrollbar=True,
            show_y_scrollbar=True,
            show_row_index=True,
            show_top_left=True,
            empty_horizontal=0,
            empty_vertical=0,
            header_font=("Segoe UI", 9, "bold"),
            font=("Segoe UI", 9, "normal"),
            header_bg="#2F5597",
            header_fg="white",
            header_selected_cells_bg="#1F497D",
            table_selected_cells_bg="#D7E4F2",
            show_selected_cells_border=True,
            selected_cells_border_color="#107C41"
        )
        self.grid.enable_bindings(
            "single_select",
            "drag_select",
            "select_all",
            "column_select",
            "row_select",
            "column_width_resize",
            "arrowkeys",
            "right_click_popup_menu",
            "rc_select",
            "copy",
            "cut",
            "paste",
            "delete",
            "undo",
            "edit_cell"
        )
        self.grid.pack(fill=tk.BOTH, expand=True)
        
        # Bind cell edits and cell selections
        self.grid.extra_bindings([
            ("cell_select", self.on_cell_select),
            ("end_edit_cell", self.on_cell_edited)
        ])
        
        # Bottom Summary Bar (Live totals & Gross Profit)
        self.summary_bar = tk.Frame(self.root, bg="#E9EEF4", relief=tk.SOLID, bd=1, height=40)
        self.summary_bar.pack(fill=tk.X, side=tk.BOTTOM, padx=8, pady=(0, 4))
        self.summary_bar.pack_propagate(False)
        
        self.lbl_sum_capital = tk.Label(self.summary_bar, text="Total Capital: ₱0.00", font=("Segoe UI", 10, "bold"), fg="#1F497D", bg="#E9EEF4")
        self.lbl_sum_capital.pack(side=tk.LEFT, padx=16, pady=6)
        
        self.lbl_sum_selling = tk.Label(self.summary_bar, text="Total Selling Price: ₱0.00", font=("Segoe UI", 10, "bold"), fg="#1F497D", bg="#E9EEF4")
        self.lbl_sum_selling.pack(side=tk.LEFT, padx=16, pady=6)
        
        self.lbl_profit = tk.Label(self.summary_bar, text="Gross Profit: ₱0.00", font=("Segoe UI", 10, "bold"), fg=self.accent_green, bg="#E9EEF4")
        self.lbl_profit.pack(side=tk.RIGHT, padx=16, pady=6)

    def browse_file(self):
        path = filedialog.askopenfilename(
            title="Open Excel Spreadsheet",
            filetypes=[("Excel Files", "*.xlsx"), ("All Files", "*.*")]
        )
        if path:
            self.load_workbook_file(path)

    def load_workbook_file(self, path):
        try:
            self.workbook = openpyxl.load_workbook(path)
            self.excel_file_path = path
            
            # Setup sheet tab buttons
            for w in self.tabs_inner.winfo_children():
                w.destroy()
                
            self.tab_buttons = {}
            sheet_names = [s for s in self.workbook.sheetnames if s != "Summary"]
            
            for s_name in sheet_names:
                btn = tk.Button(
                    self.tabs_inner, text=s_name, font=("Segoe UI", 9),
                    bg="#FFFFFF", fg="#333333", relief=tk.FLAT, bd=0, padx=12, pady=4, cursor="hand2",
                    command=lambda name=s_name: self.switch_sheet(name)
                )
                btn.pack(side=tk.LEFT, padx=2, pady=2)
                self.tab_buttons[s_name] = btn
                
            if sheet_names:
                self.switch_sheet(sheet_names[0])
                
        except Exception as e:
            messagebox.showerror("Error Opening File", f"Could not load Excel file:\n{str(e)}")

    def switch_sheet(self, sheet_name):
        # Update tab visual highlights
        for name, btn in self.tab_buttons.items():
            if name == sheet_name:
                btn.configure(bg="#107C41", fg="white", font=("Segoe UI", 9, "bold"))
            else:
                btn.configure(bg="#FFFFFF", fg="#333333", font=("Segoe UI", 9))
                
        self.current_sheet_name = sheet_name
        ws = self.workbook[sheet_name]
        
        # Read lines starting at row 8
        headers = ["Qty", "U/M", "Item Description", "Unit Capital [Edit]", "Total Capital", "Unit Price", "Total Selling Price"]
        
        self.sheet_data = []
        self.row_excel_map = []
        
        r = 8
        while True:
            qty_cell = ws.cell(row=r, column=1)
            item_cell = ws.cell(row=r, column=3)
            
            if item_cell.value == "Total" or (qty_cell.value is None and item_cell.value is None):
                break
                
            qty = qty_cell.value
            um = ws.cell(row=r, column=2).value or ""
            item_desc = item_cell.value or ""
            unit_cap = ws.cell(row=r, column=4).value
            unit_price = ws.cell(row=r, column=6).value
            
            qty_fmt = f"{qty:,}" if isinstance(qty, (int, float)) else str(qty or "")
            cap_fmt = f"{unit_cap:,.2f}" if isinstance(unit_cap, (int, float)) else ""
            
            tot_cap_fmt = ""
            if isinstance(unit_cap, (int, float)) and isinstance(qty, (int, float)):
                tot_cap_fmt = f"{qty * unit_cap:,.2f}"
                
            price_fmt = f"{unit_price:,.2f}" if isinstance(unit_price, (int, float)) else ""
            tot_sell_fmt = ""
            if isinstance(unit_price, (int, float)) and isinstance(qty, (int, float)):
                tot_sell_fmt = f"{qty * unit_price:,.2f}"
                
            self.sheet_data.append([qty_fmt, um, item_desc, cap_fmt, tot_cap_fmt, price_fmt, tot_sell_fmt])
            self.row_excel_map.append(r)
            r += 1
            
        # Bind to tksheet
        self.grid.headers(headers)
        self.grid.set_sheet_data(self.sheet_data)
        
        # Column alignments and widths
        # Col 0: Qty (align right)
        # Col 1: U/M (align center)
        # Col 2: Item (align left)
        # Col 3: Unit Capital (align right, light yellow highlight for easy spotting)
        # Col 4: Total Capital (align right)
        # Col 5: Unit Price (align right)
        # Col 6: Total Selling Price (align right)
        self.grid.column_width(column=0, width=70)
        self.grid.column_width(column=1, width=60)
        self.grid.column_width(column=2, width=340)
        self.grid.column_width(column=3, width=130)
        self.grid.column_width(column=4, width=120)
        self.grid.column_width(column=5, width=110)
        self.grid.column_width(column=6, width=130)
        
        self.grid.align_columns(columns=[0, 3, 4, 5, 6], align="e")
        self.grid.align_columns(columns=[1], align="center")
        self.grid.align_columns(columns=[2], align="w")
        
        # Highlight Unit Capital column in light yellow so employees know exactly where to type
        self.grid.highlight_columns(columns=[3], bg="#FFFDE7", fg="#000000")
        
        # Readonly on columns other than Unit Capital (col 3) to prevent accidental overwriting of descriptions
        # (Or you can edit any cell if desired!)
        self.grid.readonly_columns(columns=[0, 1, 2, 4, 5, 6])
        
        self.recalculate_totals()
        
        # Select first editable cell (row 0, col 3)
        if self.sheet_data:
            self.grid.see(row=0, column=3)
            self.grid.select_cell(row=0, column=3)

    def on_cell_select(self, event):
        row = event.selected.row
        col = event.selected.column
        if row is not None and col is not None:
            col_letter = chr(65 + col)
            self.lbl_cell_loc.config(text=f"Cell {col_letter}{row + 1}")
            val = self.grid.get_cell_data(row, col)
            self.formula_val.set(str(val or ""))

    def on_formula_entry_return(self, event):
        sel = self.grid.get_selected_cells()
        if sel:
            r, c = next(iter(sel))
            if c == 3: # Unit Capital
                self.grid.set_cell_data(r, c, self.formula_val.get())
                self.process_capital_update(r, self.formula_val.get())

    def on_cell_edited(self, event):
        row = event.row
        col = event.column
        new_val = event.value
        if col == 3: # Unit Capital
            self.process_capital_update(row, new_val)

    def process_capital_update(self, row, val_str):
        clean_str = str(val_str).replace(',', '').replace('₱', '').strip()
        num_val = None
        if clean_str:
            try:
                num_val = float(clean_str)
            except ValueError:
                messagebox.showwarning("Invalid Number", "Please enter a valid numeric value for capital price.")
                self.grid.set_cell_data(row, 3, "")
                num_val = None
                
        # Format cell display
        cap_fmt = f"{num_val:,.2f}" if num_val is not None else ""
        self.grid.set_cell_data(row, 3, cap_fmt)
        
        # Update Excel workbook in memory
        excel_row = self.row_excel_map[row]
        ws = self.workbook[self.current_sheet_name]
        cap_cell = ws.cell(row=excel_row, column=4)
        cap_cell.value = num_val
        if num_val is not None:
            cap_cell.number_format = '#,##0.00'
            
        # Update Total Capital column in grid
        qty_str = str(self.grid.get_cell_data(row, 0)).replace(',', '').strip()
        try:
            qty_val = float(qty_str) if qty_str else 0
        except:
            qty_val = 0
            
        tot_cap_fmt = f"{qty_val * num_val:,.2f}" if num_val is not None else ""
        self.grid.set_cell_data(row, 4, tot_cap_fmt)
        
        self.recalculate_totals()

    def recalculate_totals(self):
        tot_cap_sum = 0.0
        tot_sell_sum = 0.0
        
        total_rows = self.grid.get_total_rows()
        for r in range(total_rows):
            cap_str = str(self.grid.get_cell_data(r, 4)).replace(',', '').strip()
            sell_str = str(self.grid.get_cell_data(r, 6)).replace(',', '').strip()
            
            if cap_str:
                try:
                    tot_cap_sum += float(cap_str)
                except:
                    pass
            if sell_str:
                try:
                    tot_sell_sum += float(sell_str)
                except:
                    pass
                    
        self.lbl_sum_capital.config(text=f"Total Capital: ₱{tot_cap_sum:,.2f}")
        self.lbl_sum_selling.config(text=f"Total Selling Price: ₱{tot_sell_sum:,.2f}")
        
        profit = tot_sell_sum - tot_cap_sum
        profit_color = self.accent_green if profit >= 0 else "#DC3545"
        self.lbl_profit.config(text=f"Gross Profit: ₱{profit:,.2f}", fg=profit_color)

    def save_workbook(self):
        if not self.workbook or not self.excel_file_path:
            messagebox.showwarning("No File", "No Excel file is loaded.")
            return
        try:
            self.workbook.save(self.excel_file_path)
            messagebox.showinfo("Saved", f"Spreadsheet successfully saved to:\n{self.excel_file_path}")
        except Exception as e:
            messagebox.showerror("Save Error", f"Could not save file. If it is open in Microsoft Excel, please close it and try again.\n\nError: {str(e)}")

def main():
    root = tk.Tk()
    app = ExcelStyleQuoteApp(root)
    root.mainloop()

if __name__ == '__main__':
    main()
