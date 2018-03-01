tell application "iTerm2"
    tell current window
        tell current session
            -- dailygraphics tool pane
            set name to "dailygraphics"
            set webserver to (split vertically with default profile)
            -- CHANGE path to your needs
            write text "cd ~/dailygraphics/"
            write text "workon dailygraphics"
            write text "git pull"
            write text "fab -l"
        end tell
        tell webserver
            -- webserver pane
            set name to "webserver"
            set graphics to (split horizontally with default profile)
            -- CHANGE path to your needs
            write text "cd ~/dailygraphics/"
            write text "workon dailygraphics"
            write text "fab app"
        end tell
        tell graphics
            -- graphics pane
            set name to "graphics"
            -- change path to your needs
            write text "cd ~/graphics/"
            write text "git pull"
        end tell
    end tell
end tell