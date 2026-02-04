import traceback

try:
    import server
    print('import ok')
except Exception:
    traceback.print_exc()
