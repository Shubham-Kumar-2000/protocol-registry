#!/usr/bin/osascript

use AppleScript version "2.4"
use framework "Foundation"
use framework "AppKit"

on run argv
    set appFile to my getDefautltAppFor(item 1 of argv)

    if appFile = missing value then
        set output to "pr-result=false"
    else
        set output to (the POSIX path of appFile) as text
    end if

    output
end run

on getDefautltAppFor(theProto)
	set theWorkspace to current application's NSWorkspace's sharedWorkspace()
	set defaultAppURL to theWorkspace's URLForApplicationToOpenURL:(current application's |NSURL|'s URLWithString:theProto)
	if defaultAppURL = missing value then return missing value -- or false
	return defaultAppURL as «class furl»
end getDefautltAppFor