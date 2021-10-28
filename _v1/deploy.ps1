[String[]] $files = "frontend\css",
                    "frontend\fonts",
                    "frontend\img",
                    "frontend\js",
                    "frontend\config.html",
                    "frontend\viewer.html"
Remove-Item -Path "frontend.zip"
Compress-Archive -Path $files -DestinationPath "frontend.zip" -Update