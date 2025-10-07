import Papa from "papaparse";

type SheetRow = {
  gem_id: string;
  gem_category: string;
  gem_name: string;
  gem_desc: string;
  gem_imageurl: string;
};

export async function fetchSheetData(sheetId: string): Promise<SheetRow[]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  const res = await fetch(url);
  const csv = await res.text();

  const parsed = Papa.parse(csv, { header: true });

  // Log total rows fetched from Google Sheets
  console.log("Raw rows from sheet:", parsed.data.length);

const cleanedData = (parsed.data as Record<string, string>[])
    .filter(row => row.gem_id || row.gem_name)
    .map((row) => ({
      gem_id: row.gem_id?.trim() || "",
      gem_category: row.gem_category?.trim() || "",
      gem_name: row.gem_name?.trim() || "",
      gem_desc: row.gem_desc?.trim() || "",
      gem_imageurl: row.gem_imageurl?.trim() || "",
    }))
    // ✅ Sort descending by gem_id (numeric if possible)
    .sort((a, b) => {
      const numA = parseFloat(a.gem_id);
      const numB = parseFloat(b.gem_id);
      if (!isNaN(numA) && !isNaN(numB)) return numB - numA; // numeric descending
      return b.gem_id.localeCompare(a.gem_id); // fallback to string descending
    });

  // Log cleaned row count
  console.log("Cleaned rows after filter:", cleanedData.length);

  return cleanedData;
}
