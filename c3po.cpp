#include <iostream>
#include <string>
#include <vector>
#include <math.h>


/* To do:
 * Move to async websocket
 * Read from stdin on a seperate thread, then from that thread send any data to main as a string */
//typedef std::vector<std::string> str_vec;

std::string encode(std::string *str, unsigned int len) {
	int i = 0;
	std::string cur;
	std::string rt = "";
	for(;i < len; i++) {
		cur = *(str + i);
		rt += std::to_string(cur.length());
		rt += ".";
		rt += cur;
		if(i < len - 1)
			rt += ",";
		else
			rt += ";";
	}
	return rt;
}

int parseint(std::string a) {
	int i;
	sscanf(a.c_str(), "%d", &i);
	return i;
}

int digits(int num) {
	return floor(log10(num) + 1);
}

std::vector<std::string> decode(std::string a) {
	std::vector<std::string> rt;
	std::string temp = "";
	std::string e;
	int skip, pos, d, len, ind;
	for(;;) {
		sscanf(a.c_str(), "%d", &skip); // Get how many characters to skip
		d = digits(skip); // Get number of digits in number
		ind = skip + d + 1;
		e = a[ind];
		if(e == ";") {
			pos = a.find(".");
			temp = a.substr(pos + 1,skip); // Make a substring of the body of the message
			rt.push_back(temp);
			break;
		} else if(e == ",") {
			pos = a.find(".");
			temp = a.substr(pos + 1,skip);
			a = a.erase(0,ind + 1); //Erase including comma
			rt.push_back(temp);
			continue;
		} else  {
			std::cerr << "Error: Malformed UTF-8 string. " << std::endl;
			break;
		}
	}
	return rt;
}

int main() {
//	std::string test[3] = {"1+#1*1#(", "#8#8$+", "293728"};
//	unsigned short int leng = (sizeof(test)/sizeof(*test));
//	std::string encoded = encode(test, leng);
//	std::cout << encoded << std::endl;
	std::string g;
	std::cin >> g;
	std::vector<std::string> e = decode(g);
	unsigned int j = e.size();
	int i;
	for(i = 0;i < j;i++) {
		std::cout << e[i] << std::endl;
	}
	return 0;
}

