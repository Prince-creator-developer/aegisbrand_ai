import math
from typing import List, Dict, Any

def hex_to_rgb(hex_code: str):
    hex_code = hex_code.lstrip("#")
    if len(hex_code) == 3:
        hex_code = "".join([c*2 for c in hex_code])
    return tuple(int(hex_code[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_relative_luminance(rgb):
    sRGB = [v / 255.0 for v in rgb]
    lum = []
    for c in sRGB:
        if c <= 0.03928:
            lum.append(c / 12.92)
        else:
            lum.append(((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2]

def calculate_contrast_ratio(hex1: str, hex2: str) -> float:
    rgb1 = hex_to_rgb(hex1)
    rgb2 = hex_to_rgb(hex2)
    l1 = rgb_to_relative_luminance(rgb1)
    l2 = rgb_to_relative_luminance(rgb2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return round((lighter + 0.05) / (darker + 0.05), 2)

def color_distance_euclidean(hex1: str, hex2: str) -> float:
    r1, g1, b1 = hex_to_rgb(hex1)
    r2, g2, b2 = hex_to_rgb(hex2)
    return math.sqrt((r1 - r2)**2 + (g1 - g2)**2 + (b1 - b2)**2)

def audit_visual_assets(visual_data: Dict[str, Any], brand_palette: List[Dict[str, Any]], disallowed_colors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    issues = []
    if not visual_data:
        return issues

    detected_colors = visual_data.get("colors_detected", [])
    approved_hexes = [c["hex"].upper() for c in brand_palette]
    disallowed_hex_map = {d["hex"].upper(): d for d in disallowed_colors}

    # 1. Check for explicitly disallowed colors
    for col in detected_colors:
        u_col = col.upper()
        if u_col in disallowed_hex_map:
            rule = disallowed_hex_map[u_col]
            issues.append({
                "id": f"VIS-{len(issues)+1}",
                "category": "Visual Identity",
                "severity": "critical",
                "flagged_text": f"Off-Brand Hex Code: {col}",
                "guideline_ref": "Brand Identity Sec 3.1: Approved Color Palette",
                "explanation": f"Color {col} is explicitly prohibited: {rule['reason']}.",
                "intent_preserving_suggestion": f"Replace with approved brand token {rule['suggested_hex']}.",
                "diff_preview": {"delete": col, "add": rule["suggested_hex"]}
            })
        else:
            # Check proximity to approved colors
            min_dist = min([color_distance_euclidean(u_col, a_col) for a_col in approved_hexes])
            if min_dist > 90 and u_col not in ["#FFFFFF", "#000000", "#0F172A"]:
                issues.append({
                    "id": f"VIS-{len(issues)+1}",
                    "category": "Visual Identity",
                    "severity": "warning",
                    "flagged_text": f"Unregistered Accent Color: {col}",
                    "guideline_ref": "Brand Identity Sec 3.2: Palette Purity",
                    "explanation": f"The color {col} deviates from the primary brand identity palette (CIELAB/Euclidean distance {int(min_dist)}).",
                    "intent_preserving_suggestion": f"Substitute with brand primary #{approved_hexes[0]}.",
                    "diff_preview": {"delete": col, "add": f"#{approved_hexes[0]}"}
                })

    # 2. Check Contrast Ratio against White canvas
    for col in detected_colors:
        contrast_white = calculate_contrast_ratio(col, "#FFFFFF")
        if contrast_white < 3.0 and col.upper() not in ["#FFFFFF", "#0F172A"]:
            issues.append({
                "id": f"ACC-{len(issues)+1}",
                "category": "Accessibility (WCAG)",
                "severity": "warning",
                "flagged_text": f"Low Contrast Color: {col} on Light Surface",
                "guideline_ref": "Accessibility Standards WCAG 2.2 AA (Criterion 1.4.3)",
                "explanation": f"Contrast ratio is {contrast_white}:1 against white. Acceptable for large graphical shapes, but ensure body text uses high-contrast tokens (minimum 4.5:1 required).",
                "intent_preserving_suggestion": "Ensure body text is placed over a dark background or use high-contrast text color (#0F172A).",
                "diff_preview": {"delete": f"Ratio {contrast_white}:1", "add": "Compliant 4.5:1+ for text"}
            })

    # 3. Check Logo Aspect Ratio
    aspect_ratio = visual_data.get("logo_aspect_ratio", 1.0)
    if abs(aspect_ratio - 1.0) > 0.05:
        issues.append({
            "id": f"VIS-{len(issues)+1}",
            "category": "Visual Identity",
            "severity": "critical",
            "flagged_text": f"Logo Aspect Ratio Distortion: {aspect_ratio:.2f}",
            "guideline_ref": "Logo Usage Guidelines Sec 2.3: Lockup Proportions",
            "explanation": f"The brand logo lockup has been stretched or compressed (Target: 1.00:1, Detected: {aspect_ratio:.2f}:1).",
            "intent_preserving_suggestion": "Constrain proportions in design tool to an exact 1:1 square ratio.",
            "diff_preview": {"delete": f"Ratio {aspect_ratio:.2f}", "add": "1.00 Square Ratio"}
        })

    # 4. Check Alt-Text completeness
    if visual_data.get("has_alt_text") is False:
        issues.append({
            "id": f"ACC-{len(issues)+1}",
            "category": "Accessibility (WCAG)",
            "severity": "warning",
            "flagged_text": f"Missing Alt-Text on {visual_data.get('filename', 'visual asset')}",
            "guideline_ref": "Accessibility Standards WCAG 2.2 AA (Criterion 1.1.1)",
            "explanation": "Published visual assets require concise descriptive text alternatives for screen reader compatibility.",
            "intent_preserving_suggestion": "Add contextual alt-text describing the graphic and core value proposition.",
            "diff_preview": {"delete": "alt=''", "add": "alt='Descriptive brand graphic'"}
        })

    return issues
