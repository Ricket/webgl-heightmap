Usage
-----

The heightmap is loaded with AJAX from the `heightmap.json` file, but loading of
`file://` URLs is disallowed, so you need to either copy these files into your
own web server, or run a simple one via a command like:

    python -m SimpleHTTPServer [port]

i.e. just opening the index.html file in your browser will not work.