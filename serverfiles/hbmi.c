#include <stdio.h>
#include <time.h>

main() {
	time_t t = time(NULL);
	struct tm *now = localtime(&t);
	if (now->tm_wday == 0) {
		if (now->tm_mday < 8) {
			system("./supplement.hbmi monthly");
		}
	} else if (now->tm_wday == 6) {
		system("./supplement.hbmi weekly");
	} else {
		system("./supplement.hbmi daily");
	} 
}