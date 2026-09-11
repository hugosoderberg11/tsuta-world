import http.server, socketserver
class S(socketserver.ThreadingMixIn, http.server.HTTPServer): daemon_threads=True
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
S(("127.0.0.1",5500), H).serve_forever()
