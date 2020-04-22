#Region ;**** Directives created by AutoIt3Wrapper_GUI ****
#AutoIt3Wrapper_UseUpx=n
#EndRegion ;**** Directives created by AutoIt3Wrapper_GUI ****
#NoTrayIcon
#include <Misc.au3>

_Singleton(@ScriptName)

While True
	If WinExists("Host Key Verification") Then
		ControlClick(WinGetHandle("Host Key Verification"), "Accept and &Save", "[CLASS:Button]", "left", 1)
	EndIf

	If WinExists("User Authentication") Then
		ControlClick(WinGetHandle("User Authentication"), "Cancel", "[CLASSNN:Button3]", "left", 1)
	EndIf

	Sleep(100)
WEnd
