#import <Foundation/Foundation.h>
#include <CoreServices/CoreServices.h>
#include <stdio.h>
#include<string.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        if(argc<2) return 1;
        CFStringRef cfprotocol = CFStringCreateWithCString(
        kCFAllocatorDefault, argv[1], strlen(argv[1]));
        if (cfprotocol == NULL) {
            return 1;
        }
        // Create a "fake" URL that only contains the protocol component of a URI.
        CFURLRef url =CFURLCreateWithString(kCFAllocatorDefault, cfprotocol, NULL);
        if (url == NULL) {
            return 1;
        }

        // List all application bundles that request this protocol scheme.
        CFArrayRef _Nullable apps = LSCopyApplicationURLsForURL(url, kLSRolesAll);
        if (apps == NULL) {
            return 1;
        }
    }
    return 0;
}
