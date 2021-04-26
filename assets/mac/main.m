#import <Foundation/Foundation.h>
#include <CoreServices/CoreServices.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        if(argc<2) return 1;
        auto nullptr = NULL;
        auto cfprotocol = CFStringCreateWithCString(
        kCFAllocatorDefault, protocol, sizeof(protocol)/sizeof(protocol[0]));
        if (cfprotocol == nullptr) {
            return 1;
        }

        // Create a "fake" URL that only contains the protocol component of a URI.
        auto url =
            CFURLCreateWithString(kCFAllocatorDefault, cfprotocol, nullptr);
        CFRelease(cfprotocol);
        if (url == nullptr) {
            return 1;
        }

        // List all application bundles that request this protocol scheme.
        auto apps = LSCopyApplicationURLsForURL(url, kLSRolesAll);
        if (apps == nullptr) {
            return 1;
        }

        NSLog(@"Hello, World!");
    }
    return 0;
}