import { Box, Container, Typography, Link, Avatar, IconButton, Stack, Divider } from "@mui/material";
import { BsGithub, BsLinkedin, BsBoxArrowUpRight } from "react-icons/bs";
import LogoA4s from "../../assets/logo-a4s-footer.webp";

const devPhoto =
  "https://media.licdn.com/dms/image/v2/D4E03AQFE9DfXaqCLXw/profile-displayphoto-scale_400_400/B4EZ08ZIxcGkAg-/0/1774834717278?e=1786579200&v=beta&t=UvNcisuZ-9PAWRHehZPXuu6ZvnFXTkrBony36yPOZUw";

const usefulLinks = [
  { label: "Página do projeto A4S", href: "https://a4s.dev.br/" },
  {
    label: "Página do projeto Quiz A4S",
    href: "https://a4s.dev.br/quiz-a4s-e-quiz-api/",
  },
  {
    label: "Formulário de avaliação",
    href: "https://forms.gle/AyEKveL4dXGbeQPN7",
  },
  {
    label: "Repositório do Quiz A4S (front)",
    href: "https://github.com/a4s-ufpb/QuizA4S-Front",
  },
  {
    label: "Repositório do QuizAPI (back)",
    href: "https://github.com/a4s-ufpb/QuizAPI",
  },
];

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        width: "100%",
        bgcolor: "#0b0b0b",
        color: "#fff",
        pt: 5,
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr 1fr" },
            gap: 4,
          }}
        >
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Link
              href="https://apps4society.dcx.ufpb.br/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Box
                component="img"
                src={LogoA4s}
                alt="logo-a4s"
                width={150}
                height={60}
              />
            </Link>
            <Typography variant="body2" sx={{ mt: 2, color: "rgba(255,255,255,0.75)" }}>
              O Quiz A4S é Open Source! Desenvolvido pelo projeto de extensão
              Apps4Society, da Universidade Federal da Paraíba Campus IV - Rio
              Tinto.
            </Typography>
          </Box>

          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1.5 }}>
              Links úteis
            </Typography>
            <Stack spacing={1} sx={{ alignItems: { xs: "center", md: "flex-start" } }}>
              {usefulLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{
                    color: "rgba(255,255,255,0.85)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {link.label}
                  <BsBoxArrowUpRight size={12} />
                </Link>
              ))}
            </Stack>
          </Box>

          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1.5 }}>
              Desenvolvedor
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: "center", justifyContent: { xs: "center", md: "flex-start" } }}
            >
              <Avatar src={devPhoto} alt="Ronyelison Abreu" sx={{ width: 56, height: 56 }} />
              <Box>
                <Typography sx={{ fontWeight: "bold" }}>Ronyelison Abreu</Typography>
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    component="a"
                    href="https://github.com/RonyAbreu"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{ color: "#fff" }}
                    title="GitHub"
                  >
                    <BsGithub />
                  </IconButton>
                  <IconButton
                    component="a"
                    href="https://www.linkedin.com/in/ronyelison-de-oliveira-abreu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{ color: "#fff" }}
                    title="LinkedIn"
                  >
                    <BsLinkedin />
                  </IconButton>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.15)", my: 3 }} />

        <Typography
          variant="body2"
          align="center"
          sx={{ color: "rgba(255,255,255,0.6)" }}
        >
          &copy; Todos os direitos reservados ao Apps4Society - {new Date().getFullYear()}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
