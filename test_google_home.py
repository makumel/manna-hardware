from playwright.sync_api import sync_playwright

def test_google_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
            ]
        )
        context = browser.new_context()
        page = context.new_page()
        
        # Navigate to Google homepage first
        print("Visiting google.com...")
        page.goto("https://www.google.com", timeout=15000)
        print("Home Title:", page.title())
        print("Home URL:", page.url)
        
        # Try search
        if "sorry" in page.url:
            print("Google is blocking automated IP.")
        else:
            print("Google homepage loaded successfully!")
            
        browser.close()

if __name__ == '__main__':
    test_google_flow()
